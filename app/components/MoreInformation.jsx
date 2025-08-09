import React from 'react';
import { CheckCircle2 } from "lucide-react"
import Link from 'next/link';

const MoreInformationComponent = () => {
  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-[#303446] dark:to-[#232634] p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 relative inline-block text-cat-frappe-base dark:text-[#e5c890] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-[#ef9f76] after:to-[#e5c890] after:rounded-[2px]">about the site! 🐝</h2>
      <p className="mb-3 text-cat-frappe-surface1 dark:text-[#c6d0f5]">This is my stupid little blog website where I can rant about stuff. I love to talk about technology and discuss the latest stuff going on. This is also my first project with Next JS but I try to maintain it from time to time with small updates. I have been running this blog since October 2024. Sine then I have gone on to working on various other project available on my <Link href="https://github.com/ljis120301" target="_blank" rel="noopener noreferrer" className="text-[#8caaee] hover:underline">github</Link> </p>
      <ul className="list-disc list-inside text-cat-frappe-surface1 dark:text-[#c6d0f5]">
        <li>Explore my latest <Link href="https://github.com/ljis120301" target="_blank" rel="noopener noreferrer" className="text-[#8caaee] hover:underline">projects</Link></li>
        <li>I use gentoo btw</li>
        <li>connect with me on <Link href="https://Reddit.com/ljis120301" target="_blank" rel="noopener noreferrer" className="text-[#8caaee] hover:underline">Reddit</Link></li>
      </ul>

    </div>
  );
};

export default MoreInformationComponent;
