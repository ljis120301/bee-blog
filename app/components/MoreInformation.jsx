import React from 'react';
import { CheckCircle2 } from "lucide-react"

const MoreInformationComponent = () => {
  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-[#303446] dark:to-[#232634] p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 relative inline-block text-cat-frappe-base dark:text-[#e5c890] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-[#ef9f76] after:to-[#e5c890] after:rounded-[2px]">about me! 🐝</h2>
      <p className="mb-3 text-cat-frappe-surface1 dark:text-[#c6d0f5]">I am a developer who loves to code and learn new things. This is my first project using Next.js and Tailwind CSS.</p>
      <ul className="list-disc list-inside text-cat-frappe-surface1 dark:text-[#c6d0f5]">
        <li>Explore my latest <a href="https://github.com/ljis120301" target="_blank" rel="noopener noreferrer" className="text-[#8caaee] hover:underline">projects</a></li>
        <li>I use Arch btw</li>
        <li>connect with me on <a href="https://x.com/ljis120301" target="_blank" rel="noopener noreferrer" className="text-[#8caaee] hover:underline">Twitter</a></li>
      </ul>
      <div className="mt-4">
        <span className="inline-block bg-[#ef9f76] rounded-full px-3 py-1 text-sm font-semibold text-[#303446] mr-2 mb-2">#coding</span>
        <span className="inline-block bg-[#a6d189] rounded-full px-3 py-1 text-sm font-semibold text-[#303446] mr-2 mb-2">#technology</span>
        <span className="inline-block bg-[#ca9ee6] rounded-full px-3 py-1 text-sm font-semibold text-[#303446] mr-2 mb-2">#learning</span>
      </div>
    </div>
  );
};

export default MoreInformationComponent;
