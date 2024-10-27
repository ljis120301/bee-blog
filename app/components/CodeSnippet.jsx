"use client";
import React, { useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';

const CodeSnippet = ({ title, code }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    SyntaxHighlighter.registerLanguage('python', python);
    setMounted(true);
  }, []);

  const customStyle = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      fontSize: '0.9rem',
      lineHeight: '1.5',
      background: 'transparent',
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },
  };

  if (!mounted) return null;

  return (
    <div className="p-5">
      {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
      <div className="overflow-x-auto rounded-md shadow-lg bg-[#f8f8f8] dark:bg-cat-frappe-surface1">
        <SyntaxHighlighter 
          language="python" 
          style={customStyle}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={{style: {wordBreak: 'keep-all', whiteSpace: 'pre'}}}
          customStyle={{
            backgroundColor: 'transparent',
            margin: 0,
            padding: '1rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeSnippet;
