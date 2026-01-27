"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";

export default function BlogPostsList({ initialPosts }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 200);
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState(new Set());
  const [sortKey, setSortKey] = useState('newest');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();
        if (mounted && data.success) {
          setAllTags(data.tags.map(t => ({
            id: t.id,
            name: t.name,
            color_bg: t.colorBg,
            color_text: t.colorText
          })));
        }
      } catch (e) {
        console.warn('Tags load failed:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(initialPosts)) return [];
    const q = debouncedQuery.trim().toLowerCase();
    let result = initialPosts.filter((p) => {
      const hay = `${p.title ?? ""} ${p.dek ?? ""} ${p.description ?? ""} ${(p.seo_keywords ?? []).join(" ")}`.toLowerCase();
      const matchesQ = q ? hay.includes(q) : true;
      // Tags are now stored as an array of tag objects or names
      const postTagIds = new Set((p?.tags || []).map(t => typeof t === 'object' ? t.id : t));
      const matchesTags = selectedTagIds.size === 0 || Array.from(selectedTagIds).every(id => postTagIds.has(id));
      return matchesQ && matchesTags;
    });
    result = result.sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.created) - new Date(a.created);
      if (sortKey === 'oldest') return new Date(a.created) - new Date(b.created);
      if (sortKey === 'views') return (b.views || 0) - (a.views || 0);
      if (sortKey === 'reading_time') return (b.reading_time_minutes || 0) - (a.reading_time_minutes || 0);
      return 0;
    });
    return result;
  }, [initialPosts, debouncedQuery, selectedTagIds, sortKey]);

  const toggleTag = (id) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section className="rounded-lg p-4 sm:p-6 bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-cat-frappe-base dark:text-cat-frappe-yellow tracking-tight">
          All blog posts
        </h1>
        <p className="mt-2 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0">
          Search titles, descriptions and keywords. Showing {filtered.length} of {initialPosts.length}.
        </p>
        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-md border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-white/70 dark:bg-cat-frappe-mantle px-3 py-2 text-base outline-none focus:ring-2 focus:ring-cat-frappe-peach"
          />
          {/* Tag filter chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className={`inline-flex items-center h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border transition-transform ${selectedTagIds.has(t.id) ? 'scale-[1.02]' : ''}`}
                style={{ backgroundColor: t.color_bg || '#ef9f76', color: t.color_text || '#303446', borderColor: `${(t.color_text || '#303446')}22` }}
              >
                #{t.name}
              </button>
            ))}
            {allTags.length > 0 && (
              <button
                onClick={() => setSelectedTagIds(new Set())}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-white/60 dark:bg-cat-frappe-surface0 text-[#4c4f69] dark:text-cat-frappe-subtext0"
              >
                Clear
              </button>
            )}
          </div>
          {/* Sort dropdown */}
          <div className="mt-3">
            <label className="mr-2 text-xs text-[#6c6f85] dark:text-cat-frappe-subtext1">Sort:</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="rounded-md border border-[#ccd0da] dark:border-cat-frappe-surface2 bg-white/70 dark:bg-cat-frappe-mantle px-2 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="views">Most viewed</option>
              <option value="reading_time">Reading time</option>
            </select>
          </div>
        </div>
      </header>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((post) => (
          <li key={post.id} className="rounded-md border border-[#e6e9ef] dark:border-cat-frappe-surface2 bg-white/60 dark:bg-cat-frappe-surface0 p-4 hover:shadow-md transition-shadow">
            <Link href={`/blogposts/${post.id}`} className="block">
              <h2 className="text-lg font-bold text-cat-frappe-base dark:text-cat-frappe-yellow">
                {post.title}
              </h2>
              {post.dek || post.description ? (
                <p className="mt-1 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0 line-clamp-3">
                  {post.dek || post.description}
                </p>
              ) : null}
              <div className="mt-2 text-xs text-[#6c6f85] dark:text-cat-frappe-subtext1">
                <span>{new Date(post.created).toLocaleDateString()}</span>
                {post.reading_time_minutes ? (
                  <span> • {post.reading_time_minutes} min read</span>
                ) : null}
                {post.views ? <span> • {post.views} views</span> : null}
              </div>
              {Array.isArray(post?.tags) && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((t, idx) => {
                    const tag = typeof t === 'object' ? t : { id: idx, name: t };
                    return (
                      <span
                        key={tag.id || idx}
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border"
                        style={{ backgroundColor: tag.color_bg || '#ef9f76', color: tag.color_text || '#303446', borderColor: `${(tag.color_text || '#303446')}22` }}
                      >
                        #{tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="mt-8 text-center text-[#4c4f69] dark:text-cat-frappe-subtext0">
          No posts match your search.
        </div>
      )}
    </section>
  );
}
