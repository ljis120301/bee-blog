"use client";

/**
 * Tag and Engagement Card - Prisma Version
 * =========================================
 */
import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import FavoriteButton from '@/components/app/shared/FavoriteButton';

export default function TagAndEngagementCard({ postId, tagIds = [], tags: preFetchedTags = [] }) {
  const [tags, setTags] = React.useState(preFetchedTags);
  const { user, isAuthenticated } = useAuth();
  const username = user?.username || user?.name;

  React.useEffect(() => {
    // If tags were pre-fetched, use those
    if (preFetchedTags.length > 0) {
      setTags(preFetchedTags);
      return;
    }

    // Otherwise fetch tags from API
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      setTags([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/tags');
        const data = await res.json();

        if (data.success && !cancelled) {
          const filtered = data.tags.filter(t => tagIds.includes(t.id));
          setTags(filtered);
        }
      } catch {
        if (!cancelled) setTags([]);
      }
    })();

    return () => { cancelled = true; };
  }, [JSON.stringify(tagIds), JSON.stringify(preFetchedTags)]);

  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-cat-frappe-base dark:to-cat-frappe-crust p-4 rounded-xl shadow-lg">
      {/* Tags row (if any) */}
      {tags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border"
                style={{
                  backgroundColor: t.colorBg || t.color_bg || '#ef9f76',
                  color: t.colorText || t.color_text || '#303446',
                  borderColor: `${(t.colorText || t.color_text || '#303446')}22`,
                }}
              >
                #{t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg p-3 bg-white/70 dark:bg-cat-frappe-base/60 ring-1 ring-black/5 dark:ring-white/10">
        {!isAuthenticated ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-cat-frappe-base dark:text-cat-frappe-yellow font-semibold">Enjoying the content?</p>
              <p className="text-xs text-[#4c4f69] dark:text-cat-frappe-subtext0">Sign in or create an account to save favorites.</p>
            </div>
            <a
              href="/auth"
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-yellow hover:bg-cat-frappe-yellow/20"
            >
              Sign in
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-cat-frappe-base dark:text-cat-frappe-yellow font-semibold">Hi, {username}</p>
              <p className="text-xs text-[#4c4f69] dark:text-cat-frappe-subtext0">{postId ? 'Did you enjoy this post? Like to save it.' : 'Glad you\'re here. Explore and save your favorites.'}</p>
            </div>
            {postId ? (
              <FavoriteButton postId={postId} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
