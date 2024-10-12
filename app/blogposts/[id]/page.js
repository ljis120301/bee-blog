"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import CodeSnippet from "../../components/CodeSnippet";
import { HoneycombLoader } from '@/components/ui/bee-skeleton';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const record = await pb.collection('posts').getOne(id);
        setPost(record);
        // Add a small delay before setting contentReady to true
        setTimeout(() => setContentReady(true), 100);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPost();
  }, [id]);

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

  return (
    <>
      <Head>
        <title>{post?.title || 'Loading...'}</title>
        <meta name="description" content={post?.description || ''} />
      </Head>
      <Header />
      <div className={`transition-opacity duration-300 ease-in-out ${contentReady ? 'opacity-100' : 'opacity-0'}`}>
        {post && (
          <div className="pt-24">
            <div className="flex justify-center items-center p-4">
              <h2 className="text-3xl sm:text-4xl text-center mb-5 relative inline-block text-[#e5c890] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-[#ef9f76] after:to-[#e5c890] after:rounded-[2px] font-bold">
                {post.title}
              </h2>
            </div>
            <main className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
              <section className="my-10">
                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="xl:w-1/5">
                    <Information />
                  </div>
                  <div className="xl:w-3/5">
                    <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
                      <div className="rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                        <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl mb-6">
                          {post.description}
                        </p>
                        <div className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                          {renderContent()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="xl:w-1/5">
                    <MoreInformation />
                  </div>
                </div>
              </section>
            </main>
          </div>
        )}
      </div>
      {!contentReady && (
        <div className="fixed inset-0 flex items-center justify-center bg-yellow-1 dark:bg-cat-frappe-base">
          <HoneycombLoader />
        </div>
      )}
      <Footer />
    </>
  );
}
