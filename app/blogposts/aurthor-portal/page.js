"use client";
import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";

export default function AuthorPortal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Title:', title);
    console.log('Content:', content);
    // Here you would typically send this data to your backend
  };
``
  const renderPreview = () => {
    if (!mounted) return null;

    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    let codeBlock = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          result.push(
            <pre key={`code-${i}`} className="bg-[#2b2e3b] text-[#e5c890] p-4 rounded-md overflow-x-auto">
              <code>{codeBlock.join('\n')}</code>
            </pre>
          );
          codeBlock = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
      } else if (inCodeBlock) {
        codeBlock.push(line);
      } else if (line.startsWith('# ')) {
        result.push(<h1 key={i} className="text-3xl font-bold mt-4 mb-2">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        result.push(<h2 key={i} className="text-2xl font-bold mt-3 mb-2">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        result.push(<h3 key={i} className="text-xl font-bold mt-2 mb-1">{line.slice(4)}</h3>);
      } else {
        result.push(<p key={i} className="mb-2">{line}</p>);
      }
    }

    if (inCodeBlock) {
      result.push(
        <pre key={`code-${lines.length}`} className="bg-[#2b2e3b] text-[#e5c890] p-4 rounded-md overflow-x-auto">
          <code>{codeBlock.join('\n')}</code>
        </pre>
      );
    }

    return result;
  };

  return (
    <>
      <ScrollProgressBar />
      <Header />
      <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          <aside className="lg:col-span-1">
            <Information />
          </aside>
          <div className="lg:col-span-2">
            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
              <div className="rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                  author portal 🐝✍️
                </h1>
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl mb-6">
                  create your buzzing new blog post here!
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-lg font-medium text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      placeholder="Enter your blog post title"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-lg font-medium text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">
                      Content
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows="10"
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      placeholder="Write your blog post content here"
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-cat-frappe-peach to-cat-frappe-yellow text-cat-frappe-base dark:text-cat-frappe-crust py-2 px-4 rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Publish Post 🐝
                    </button>
                  </div>
                </form>
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">Preview</h2>
                  <div className="bg-[#eff1f5] dark:bg-cat-frappe-surface0 p-4 rounded-md">
                    <h1 className="text-3xl font-bold mb-4">{title}</h1>
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1">
            <MoreInformation />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}