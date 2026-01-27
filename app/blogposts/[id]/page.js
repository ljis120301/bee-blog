import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

// Generate dynamic metadata for each blog post - Critical for SEO
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const post = await db.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return {
        title: 'Post Not Found | BeeBlog',
        description: 'The requested blog post could not be found.',
        robots: { index: false, follow: false },
      };
    }

    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.description || post.dek || `Read ${post.title} on BeeBlog - Your hive for coding insights and tech trends.`;
    const url = `https://bee.whoisjason.me/blogposts/${resolvedParams.id}`;
    const imageUrl = post.heroImageUrl || 'https://bee.whoisjason.me/og-default.jpg';

    // Generate extensive keywords for maximum SEO coverage
    const seoKeywords = post.seoKeywords ? JSON.parse(post.seoKeywords) : [];
    const additionalKeywords = [
      'beeblog', 'programming', 'tech', 'coding', 'web development', 'blog',
      'software engineering', 'javascript', 'typescript', 'react', 'nextjs',
      'frontend', 'backend', 'fullstack', 'developer', 'tutorial', 'guide',
      'best practices', 'tips', 'tricks', 'coding tips', 'programming guide',
      'tech blog', 'developer blog', 'coding blog', 'programming blog',
      'web dev', 'software development', 'computer science', 'technology',
      'programming tutorial', 'coding tutorial', 'web development tutorial',
      'tech tips', 'developer tips', 'programming tips', 'coding advice',
      'software engineer', 'web developer', 'frontend developer', 'backend developer',
      'jason', 'bee blog', 'bee coding', 'tech insights', 'programming insights',
      'development', 'code', 'programming languages', 'framework', 'library',
      'api', 'database', 'algorithm', 'data structure', 'debugging', 'testing'
    ];
    const allKeywords = [...new Set([...seoKeywords, ...additionalKeywords])];

    // Create comprehensive metadata object with extensive SEO tags
    return {
      title,
      description,
      keywords: allKeywords.join(', '),
      authors: [
        { name: 'Jason', url: 'https://bee.whoisjason.me/about' },
        { name: 'BeeBlog Team', url: 'https://bee.whoisjason.me' }
      ],
      creator: 'Jason',
      publisher: 'BeeBlog',
      applicationName: 'BeeBlog',
      generator: 'Next.js',
      referrer: 'origin-when-cross-origin',
      category: 'Technology',
      classification: 'Programming Blog',
      openGraph: {
        title,
        description,
        url,
        siteName: 'BeeBlog - Buzzing with Code and Tech',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
          },
          {
            url: 'https://bee.whoisjason.me/bee-icon.ico',
            width: 180,
            height: 180,
            alt: 'BeeBlog Logo',
            type: 'image/x-icon',
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        expirationTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        section: 'Technology',
        tags: allKeywords,
        authors: ['Jason'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@your_twitter_handle',
        site: '@beeblog_official',
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: url,
        languages: { 'en-US': url, 'en': url },
        types: {
          'application/rss+xml': 'https://bee.whoisjason.me/feed.xml',
        },
      },
      other: {
        'article:author': 'Jason',
        'article:publisher': 'https://bee.whoisjason.me',
        'article:published_time': post.createdAt.toISOString(),
        'article:modified_time': post.updatedAt.toISOString(),
        'theme-color': '#E9D4BA',
        'reading-time': post.readingTimeMinutes ? `${post.readingTimeMinutes} minutes` : '5 minutes',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post Not Found | BeeBlog',
      description: 'The requested blog post could not be found.',
      robots: { index: false, follow: false },
    };
  }
}

export default async function BlogPost({ params }) {
  try {
    const resolvedParams = await params;
    const post = await db.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        tags: { include: { tag: true } },
        comments: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return notFound();
    }

    // Increment view counter (fire and forget)
    db.post.update({
      where: { id: resolvedParams.id },
      data: { views: { increment: 1 } },
    }).catch(() => { });

    // Transform post data for client component
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      description: post.description,
      dek: post.dek,
      hero_image_url: post.heroImageUrl,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      seo_keywords: post.seoKeywords ? JSON.parse(post.seoKeywords) : [],
      isSpanTwo: post.isSpanTwo,
      reading_time_minutes: post.readingTimeMinutes,
      views: post.views,
      created: post.createdAt.toISOString(),
      updated: post.updatedAt.toISOString(),
      tags: post.tags.map(pt => pt.tag.name),
      author: post.author?.name || post.author?.username || 'Anonymous',
      comments: post.comments.map(c => ({
        id: c.id,
        content: c.content,
        created: c.createdAt.toISOString(),
        author: c.author?.name || c.author?.username || 'Anonymous',
      })),
    };

    return <BlogPostClient post={transformedPost} params={resolvedParams} />;
  } catch (error) {
    console.error('Error fetching post:', error);
    return notFound();
  }
}
