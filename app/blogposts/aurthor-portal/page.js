"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import CodeSnippet from "../../components/CodeSnippet";

export default function AuthorPortal() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isSpanTwo, setIsSpanTwo] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (pb.authStore.isValid) {
        const user = pb.authStore.model;
        if (user.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
    };
    checkAdminStatus();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title,
        content,
        description,
        author: pb.authStore.model.id,
        isSpanTwo,
      };
      const record = await pb.collection('posts').create(data);
      router.push(`/blogposts/${record.id}`);
    } catch (error) {
      console.error('Error publishing post:', error);
    }
  };

  const renderPreview = () => {
    const contentElements = [];
    const lines = content.split('\n');
    let isInCodeBlock = false;
    let codeBlock = [];
    let language = '';

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (isInCodeBlock) {
          contentElements.push(
            <CodeSnippet key={`code-${index}`} language={language} code={codeBlock.join('\n')} />
          );
          codeBlock = [];
          isInCodeBlock = false;
        } else {
          isInCodeBlock = true;
          language = line.trim().slice(3);
        }
      } else if (isInCodeBlock) {
        codeBlock.push(line);
      } else if (line.startsWith('# ')) {
        contentElements.push(
          <h1 key={index} className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        contentElements.push(
          <h2 key={index} className="text-3xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        contentElements.push(
          <h3 key={index} className="text-2xl font-bold mb-3 text-cat-frappe-base dark:text-cat-frappe-yellow">
            {line.slice(4)}
          </h3>
        );
      } else {
        contentElements.push(<p key={index} className="mb-4">{line}</p>);
      }
    });

    if (isInCodeBlock) {
      contentElements.push(
        <CodeSnippet key={`code-last`} language={language} code={codeBlock.join('\n')} />
      );
    }

    return <div>{contentElements}</div>;
  };

  if (!isAdmin) {
    return <div>Loading...</div>;
  }

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
                  Author Portal
                </h1>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Title</label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">Content</label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows="10"
                      className="w-full px-3 py-2 border border-cat-frappe-surface1 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach focus:border-transparent bg-[#eff1f5] dark:bg-cat-frappe-surface0 text-cat-frappe-base dark:text-cat-frappe-text"
                      placeholder="Write your blog post content here"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSpanTwo}
                        onChange={() => setIsSpanTwo(!isSpanTwo)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Span Two Columns
                      </span>
                    </label>
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
