"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import CodeSnippet from "../../components/CodeSnippet";
import Image from 'next/image';

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const record = await pb.collection('posts').getOne(params.id);
        setPost(record);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [params.id]);

  const renderContent = () => {
    if (!post) return null;

    const contentElements = [];
    const lines = post.content.split('\n');
    let isInCodeBlock = false;
    let codeBlock = [];
    let language = '';

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (isInCodeBlock) {
          contentElements.push(
            <div key={`code-${index}`} className="overflow-x-auto max-w-full">
              <CodeSnippet language={language} code={codeBlock.join('\n')} />
            </div>
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
          <h1 key={index} className="text-2xl sm:text-3xl font-bold mb-4 break-words">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        contentElements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-bold mb-3 break-words">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        contentElements.push(
          <h3 key={index} className="text-lg sm:text-xl font-bold mb-2 break-words">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('![') && line.includes('](') && line.endsWith(')')) {
        // Image syntax: ![alt text](image_url)
        const altText = line.slice(2, line.indexOf(']'));
        const imageUrl = line.slice(line.indexOf('(') + 1, -1);
        contentElements.push(
          <div key={index} className="my-4">
            <Image
              src={imageUrl}
              alt={altText}
              width={800}
              height={600}
              layout="responsive"
              className="rounded-lg"
            />
          </div>
        );
      } else {
        contentElements.push(
          <p key={index} className="mb-4 break-words">
            {line}
          </p>
        );
      }
    });

    return contentElements;
  };

  if (!post) {
    return (
      <>
        <ScrollProgressBar />
        <Header />
        <main className="pt-[calc(64px+8px)] text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px] min-h-screen flex items-center justify-center">
          <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow animate-pulse">
            <div className="rounded-lg p-8 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-t-4 border-cat-frappe-yellow border-solid rounded-full animate-spin"></div>
                <h2 className="mt-4 text-xl font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow">
                  Loading post 🌈...
                </h2>
                <p className="mt-2 text-cat-frappe-subtext0">Please bee patient!</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
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
              <div className="rounded-lg p-3 sm:p-4 lg:p-6 bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg overflow-hidden">
                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-4 sm:mt-8 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 break-words">
                  {post.description}
                </p>
                <div className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-4 sm:mt-8 text-sm sm:text-base lg:text-lg break-words">
                  {renderContent()}
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
