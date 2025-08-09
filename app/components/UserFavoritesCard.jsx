"use client";
import React from 'react';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useFavorites } from '@/app/contexts/FavoritesContext';

export default function UserFavoritesCard({ limit = 5 }) {
  const { favorites, loading, fetchFavorites } = useFavorites();
  const isSignedIn = !!(pb?.authStore?.isValid);

  React.useEffect(() => {
    if (isSignedIn) {
      fetchFavorites().catch(() => {});
    }
  }, [isSignedIn, fetchFavorites]);

  if (!isSignedIn) return null;

  const items = (favorites || []).slice(0, limit).map((fav) => {
    const post = fav.expand?.posts || fav.posts;
    const postId = typeof post === 'string' ? post : post?.id;
    const title = typeof post === 'object' ? (post?.title || 'Untitled') : `Post ${postId}`;
    return { id: postId, title };
  }).filter((x) => !!x.id);

  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-cat-frappe-base dark:to-cat-frappe-crust p-4 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow">Your favorites</h3>
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-yellow">
          {items.length} saved
        </span>
      </div>
      {loading ? (
        <p className="text-sm text-[#6c6f85] dark:text-cat-frappe-subtext1">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-sm text-[#6c6f85] dark:text-cat-frappe-subtext1">
          No favorites yet. Explore posts and click the heart to save.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className="group">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-[11px] text-[#6c6f85] dark:text-cat-frappe-subtext1 text-right">{i + 1}.</span>
                <Link href={`/blogposts/${item.id}`} className="flex-1 text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow line-clamp-1 group-hover:underline">
                  {item.title}
                </Link>
              </div>
              <div className="mt-2 h-px bg-white/60 dark:bg-cat-frappe-base/40" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


