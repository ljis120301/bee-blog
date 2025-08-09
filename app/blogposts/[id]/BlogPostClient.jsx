"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { IconEdit, IconFileText } from "@tabler/icons-react";
import StructuredData from "../../components/StructuredData";
import Breadcrumb from "../../components/Breadcrumb";
import SEOOptimizedContent from "../../components/SEOOptimizedContent";
import AIOptimizedContent from "../../components/AIOptimizedContent";
import AIContentMarkers from "../../components/AIContentMarkers";
import AISchemaMarkup from "../../components/AISchemaMarkup";
import ShareButtons from "../../components/ShareButtons";
import ReadingProgress from "../../components/ReadingProgress";
import VoiceSearchOptimization from "../../components/VoiceSearchOptimization";
import VisualSearchOptimization from "../../components/VisualSearchOptimization";
import MobileFirstOptimization from "../../components/MobileFirstOptimization";
import BehavioralMetricsOptimization from "../../components/BehavioralMetricsOptimization";
import UniqueVisitorTracker from "../../components/UniqueVisitorTracker";

export default function BlogPostClient({ post: initialPost, params }) {
  const [post, setPost] = useState(initialPost);
  const router = useRouter();
  const [mdParser, setMdParser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check current user for auth context
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
      setIsAuthor(pb.authStore.model.role === "admin" || pb.authStore.model.role === "author");
    }

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

    const checkAuthorStatus = () => {
      if (pb.authStore.isValid) {
        const user = pb.authStore.model;
        const authorStatus = user.role === "admin" || user.role === "author";
        setIsAuthor(authorStatus);
      }
    };

    initializeMdParser();
    checkAuthorStatus();
  }, []);

  const getBodyAndToc = () => {
    if (!post) return { elements: null, toc: [] };

    const looksLikeHtml = typeof post.content === 'string' && /<\w+[^>]*>/.test(post.content);
    const htmlContent = looksLikeHtml && !post.content.trim().startsWith('#')
      ? post.content
      : (mdParser ? mdParser.render(post.content) : post.content);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Build TOC and ensure heading IDs
    const toc = [];
    const slugify = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    doc.querySelectorAll('h1, h2, h3, h4').forEach((el) => {
      const text = el.textContent || '';
      if (!text) return;
      const id = el.id || slugify(text);
      el.id = id;
      const level = Number(el.tagName.replace('H', ''));
      if (level >= 2 && level <= 4) {
        toc.push({ id, text, level });
      }
    });

    return {
      elements: (
        <div className="prose dark:prose-invert text-base max-w-3xl lg:max-w-4xl mx-auto">
          <div dangerouslySetInnerHTML={{ __html: doc.body.innerHTML }} />
        </div>
      ),
      toc,
    };
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
      <StructuredData post={post} type="blogPost" />
      <StructuredData post={post} type="breadcrumb" />
      <AISchemaMarkup post={post} />
      <VoiceSearchOptimization post={post} />
      <VisualSearchOptimization post={post} />
      <MobileFirstOptimization />
      <BehavioralMetricsOptimization post={post} />
      <UniqueVisitorTracker postId={post.id} userId={currentUser?.id} />
      <ReadingProgress />
      <ScrollProgressBar />
      <Header />
      <main className="pt-[calc(64px+8px)] text-lg">
        {/* Hero */}
        {post.hero_image_url && (
          <div className="w-full">
            <div className="relative w-full h-[32vh] sm:h-[40vh] lg:h-[48vh] overflow-hidden">
              <img src={post.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <div className="container mx-auto px-2 sm:px-4 md:px-6 max-w-[1200px]">
          <Breadcrumb 
            items={[
              { name: 'Blog Posts', href: '/blogposts', icon: IconFileText },
              { name: post?.title || 'Post', href: '#' }
            ]} 
          />
          {(() => { const { elements, toc } = getBodyAndToc(); return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            <div className="lg:col-span-8">
                                <AIContentMarkers post={post}>
                    <AIOptimizedContent post={post}>
                      <SEOOptimizedContent post={post}>
                        <article className="rounded-lg p-4 sm:p-6 bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg">
                <header className="mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-cat-frappe-base dark:text-cat-frappe-yellow tracking-tight flex-1">{post.title}</h1>
                    {isAuthor && (
                      <button
                        onClick={() => router.push(`/blogposts/edit/${params.id}`)}
                        className="ml-4 p-2 text-blue-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit this post"
                      >
                        <IconEdit size={24} />
                      </button>
                    )}
                  </div>
                  {post.dek && (
                    <p className="text-lg md:text-xl mt-3 text-[#4c4f69] dark:text-cat-frappe-subtext0">{post.dek}</p>
                  )}
                  <div className="mt-4 text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0 flex flex-wrap gap-3">
                    <span>{new Date(post.created).toLocaleDateString()}</span>
                    {post.reading_time_minutes ? <span>• {post.reading_time_minutes} min read</span> : null}
                    {post.views ? <span>• {post.views} views</span> : null}
                  </div>
                </header>
                <section className="mt-6">
                  {elements}
                </section>
                
                {/* Social sharing section */}
                <div className="mt-8 pt-6 border-t border-[#ccd0da] dark:border-cat-frappe-surface2">
                  <ShareButtons 
                    url={`https://bee.whoisjason.me/blogposts/${params.id}`}
                    title={post.title}
                    description={post.description || post.dek}
                    imageUrl={post.hero_image_url || 'https://bee.whoisjason.me/og-default.jpg'}
                    tags={Array.isArray(post.seo_keywords) ? post.seo_keywords.join(',') : 'coding,programming,tech,beeblog'}
                  />
                </div>
                                      </article>
                      </SEOOptimizedContent>
                    </AIOptimizedContent>
                  </AIContentMarkers>
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-[88px]">
                {post.toc_enabled && toc.length > 0 && (
                  <div className="rounded-lg p-4 bg-[#F6EEE5] dark:bg-cat-frappe-base shadow-lg mb-4">
                    <h2 className="text-lg font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mb-2">On this page</h2>
                    <nav>
                      <ul className="space-y-1">
                        {toc.map((item, i) => (
                          <li key={i} className={item.level === 3 ? 'ml-3' : item.level === 4 ? 'ml-6' : ''}>
                            <a href={`#${item.id}`} className="text-sm text-[#4c4f69] dark:text-cat-frappe-subtext0 hover:text-cat-frappe-peach">
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                )}
                <Information />
                <div className="mt-4">
                  <MoreInformation />
                </div>
              </div>
            </aside>
          </div>
          ) })()}
        </div>
      </main>
      <Footer />
    </>
  );
}
