"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import MarkdownIt from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import CodeSnippet from "../../components/CodeSnippet";

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const params = useParams();
  const [mdParser, setMdParser] = useState(null);

  useEffect(() => {
    const initializeMdParser = () => {
      const mdInstance = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true,
      })
      .use(sub)
      .use(sup)
      .use(ins)
      .use(mark)
      .use(taskLists);

      // Enable all header levels
      mdInstance.enable('heading');

      setMdParser(mdInstance);
    };

    initializeMdParser();

    const fetchPost = async () => {
      try {
        const record = await pb.collection('posts').getOne(params.id);
        setPost(record);
        
        // Increment view counter
        await pb.collection('posts').update(params.id, {
          views: (record.views || 0) + 1
        });
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [params.id]);

  const renderContent = () => {
    if (!post || !mdParser) return null;

    // Process markdown content
    const htmlContent = mdParser.render(post.content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const contentElements = [];

    // Process all nodes in order
    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if it's a video element
        if (node.tagName === 'VIDEO') {
          const videoSources = Array.from(node.getElementsByTagName('source')).map((source, idx) => (
            <source key={idx} src={source.src} type={source.type} />
          ));

          contentElements.push(
            <div key={`video-${index}`} className="video-wrapper">
              <video
                controls
                preload="metadata"
                width="100%"
                className="max-w-full h-auto my-4 rounded-md"
                playsInline
              >
                {videoSources}
                <p>Your browser doesn't support HTML5 video.</p>
              </video>
            </div>
          );
        } else {
          contentElements.push(
            <div key={`element-${index}`} dangerouslySetInnerHTML={{ __html: node.outerHTML }} />
          );
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        contentElements.push(
          <div key={`text-${index}`}>{node.textContent}</div>
        );
      }
    });

    return <div className="prose dark:prose-invert max-w-none">{contentElements}</div>;
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
                <h1 className="text-3xl font-bold mb-4 text-cat-frappe-base dark:text-cat-frappe-yellow">{post.title}</h1>
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
