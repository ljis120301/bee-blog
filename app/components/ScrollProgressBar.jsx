'use client';

import React, { useState, useEffect } from 'react';

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = `${scrollPx / winHeightPx * 100}%`;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return (
    <div className="w-full h-2 bg-yellow-1 dark:bg-cat-frappe-surface0">
      <div
        className="h-full bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow"
        style={{ width: scrollProgress }}
      ></div>
    </div>
  );
};

export default ScrollProgressBar;
