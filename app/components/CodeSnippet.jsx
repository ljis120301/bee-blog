"use client";
import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python"; // Import Python language
import "prismjs/themes/prism.css"; // Import Prism's default theme

const CodeSnippet = ({ title, code }) => {
  useEffect(() => {
    Prism.highlightAll(); // Highlight all code blocks on component mount
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-3 text-cat-frappe-base dark:text-cat-frappe-yellow">{title}</h2>
      <pre className="rounded-lg p-1 bg-white dark:bg-gradient-to-r dark:from-cat-frappe-peach dark:to-cat-frappe-yellow">
        <code className="language-python rounded-lg block p-4 bg-gray-50 dark:bg-cat-frappe-mantle text-gray-800 dark:text-cat-frappe-subtext0 text-sm sm:text-base overflow-x-auto">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
