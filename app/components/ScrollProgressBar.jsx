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
    <div className="fixed top-0 left-0 w-full h-2 bg-cat-frappe-surface0 z-50">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <FlowerPattern />
      </div>
      <div
        className="h-full bg-cat-frappe-yellow transition-all duration-300 ease-out relative"
        style={{ width: `${scrollProgress}%` }}
      >
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 z-10">
          <BeeIcon progress={scrollProgress} />
        </div>
      </div>
    </div>
  );
};

const BeeIcon = ({ progress }) => (
  <div className="relative w-8 h-8 animate-float">
    <Image
      src="/bee-icon.ico"
      alt="Bee"
      width={36}
      height={36}
      className="w-8 h-8 transform rotate-90"
    />

  </div>
);

const FlowerPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <pattern id="flowerPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="2" fill="#babbf1" opacity="0.5" />
      <circle cx="8" cy="12" r="2" fill="#f2d5cf" opacity="0.5" />
      <circle cx="16" cy="12" r="2" fill="#f2d5cf" opacity="0.5" />
      <circle cx="12" cy="8" r="2" fill="#f2d5cf" opacity="0.5" />
      <circle cx="12" cy="16" r="2" fill="#f2d5cf" opacity="0.5" />
    </pattern>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#flowerPattern)" />
  </svg>
);

export default ScrollProgressBar;
