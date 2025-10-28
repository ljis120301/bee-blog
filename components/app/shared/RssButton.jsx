"use client";
import React from 'react';
import { IconRss } from '@tabler/icons-react';

/**
 * RSS Button Component
 * Provides a visible way for users to subscribe to the blog via RSS
 * Can be placed in the header, footer, or blog listing page
 */
export default function RssButton({ 
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'default', // 'default', 'minimal', 'icon-only'
  className = ''
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const handleClick = () => {
    window.open('https://bee.whoisjason.me/feed.xml', '_blank');
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-lg hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/50 transition-all ${sizeClasses[size]} ${className}`}
        title="Subscribe via RSS"
        aria-label="Subscribe via RSS"
      >
        <IconRss size={iconSizes[size]} className="text-cat-frappe-peach" />
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <a
        href="https://bee.whoisjason.me/feed.xml"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-cat-frappe-base dark:text-cat-frappe-text hover:text-cat-frappe-peach transition-colors ${className}`}
      >
        <IconRss size={iconSizes[size]} />
        <span className={sizeClasses[size]}>RSS Feed</span>
      </a>
    );
  }

  // Default variant - full button
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base hover:shadow-lg transition-all ${sizeClasses[size]} ${className}`}
      title="Subscribe to BeeBlog via RSS"
    >
      <IconRss size={iconSizes[size]} />
      <span>Subscribe via RSS</span>
    </button>
  );
}

