"use client";
import React from 'react';
import Link from 'next/link';
import { IconTrendingUp } from '@tabler/icons-react';

export default function MostLikedCard({ limit = 5, title = 'Most liked' }) {
  const [state, setState] = React.useState({ loading: true, error: null, items: [] });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/analytics/most-liked?limit=${limit}`);
        const json = await res.json();
        if (!cancelled) {
          if (json?.success) setState({ loading: false, error: null, items: json.items || [] });
          else setState({ loading: false, error: new Error('Failed'), items: [] });
        }
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e, items: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-cat-frappe-base dark:to-cat-frappe-crust p-4 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow flex items-center gap-2">
          <IconTrendingUp size={18} className="text-cat-frappe-peach" /> {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-yellow">
          Top {state.items.length || 0}
        </span>
      </div>
      {state.loading ? (
        <p className="text-sm text-[#6c6f85] dark:text-cat-frappe-subtext1">Loading…</p>
      ) : state.error ? (
        <p className="text-sm text-red-600">Failed to load</p>
      ) : (
        <ul className="space-y-2">
          {state.items.map((item) => (
            <li key={item.id}>
              <Link href={`/blogposts/${item.id}`} className="block text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow line-clamp-1 hover:underline">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


