import React from 'react';

const InformationComponent = () => {
  return (
    <div className="bg-yellow-1 dark:bg-gradient-to-br dark:from-cat-frappe-base dark:to-cat-frappe-crust p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">Welcome to beeblog! ✨</h2>
      <p className="mb-3 text-cat-frappe-surface1 dark:text-cat-frappe-text">Here you'll find a collection of my thoughts, projects, and adventures in the world of coding and technology. ✨</p>
      <ul className="list-disc list-inside text-cat-frappe-surface1 dark:text-cat-frappe-text">
        <li>Explore my latest projects</li>
        <li>Learn about new technologies</li>
        <li>Get inspired for your own coding journey</li>
      </ul>
      <div className="mt-4">
        <span className="inline-block bg-cat-frappe-peach dark:bg-cat-frappe-peach rounded-full px-3 py-1 text-sm font-semibold text-cat-frappe-base dark:text-cat-frappe-base mr-2 mb-2">#coding</span>
        <span className="inline-block bg-cat-frappe-green dark:bg-cat-frappe-green rounded-full px-3 py-1 text-sm font-semibold text-cat-frappe-base dark:text-cat-frappe-base mr-2 mb-2">#technology</span>
        <span className="inline-block bg-cat-frappe-lavender dark:bg-cat-frappe-lavender rounded-full px-3 py-1 text-sm font-semibold text-cat-frappe-base dark:text-cat-frappe-base mr-2 mb-2">#learning</span>
      </div>
    </div>
  );
};

export default InformationComponent;