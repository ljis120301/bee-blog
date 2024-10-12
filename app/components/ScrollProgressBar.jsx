'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-1 bg-cat-frappe-surface0 dark:bg-cat-frappe-surface1">
      <div
        className="h-full bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow transition-all duration-300 ease-out relative"
        style={{ width: `${scrollProgress}%` }}
      >
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
          <BeeIcon progress={scrollProgress} />
        </div>
      </div>
    </div>
  );
};

const BeeIcon = ({ progress }) => (
  <div className="relative w-3 h-3 animate-float">
    <Image
      src="/bee-icon.ico"
      alt="Bee"
      width={12}
      height={12}
      className="w-3 h-3 transform rotate-90"
    />
  </div>
);

export default ScrollProgressBar;
