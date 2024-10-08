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
      <h1 className="text-2xl font-bold">{title}</h1>
      <pre className="bg-light-blue rounded-lg p-6">
        <code className="language-python border border-light-blue outline outline-4 outline-light-blue p-4 rounded-lg block">
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
