import React from 'react';
import { pb } from '@/lib/pocketbase';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

// Generate dynamic metadata for each blog post - Critical for SEO
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const post = await pb.collection('posts').getOne(resolvedParams.id);
    
    const title = post.seo_title || post.title;
    const description = post.seo_description || post.description || post.dek || `Read ${post.title} on BeeBlog - Your hive for coding insights and tech trends.`;
    const url = `https://bee.whoisjason.me/blogposts/${resolvedParams.id}`;
    const imageUrl = post.hero_image_url || 'https://bee.whoisjason.me/og-default.jpg';
    
    // Generate extensive keywords for maximum SEO coverage
    const baseKeywords = Array.isArray(post.seo_keywords) ? post.seo_keywords : [];
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
    const allKeywords = [...new Set([...baseKeywords, ...additionalKeywords])];

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
        publishedTime: post.created,
        modifiedTime: post.updated || post.created,
        expirationTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
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
        app: {
          name: 'BeeBlog',
          id: {
            iphone: 'app-id-here',
            ipad: 'app-id-here',
            googleplay: 'app-id-here',
          },
          url: {
            iphone: url,
            ipad: url,
            googleplay: url,
          },
        },
      },
      facebook: {
        appId: 'your-facebook-app-id',
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
        bingBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: url,
        languages: {
          'en-US': url,
          'en': url,
        },
        media: {
          'only screen and (max-width: 600px)': `${url}?mobile=true`,
        },
        types: {
          'application/rss+xml': 'https://bee.whoisjason.me/feed.xml',
          'application/atom+xml': 'https://bee.whoisjason.me/atom.xml',
        },
      },
      icons: {
        icon: [
          { url: '/bee-icon.ico' },
          { url: '/bee-icon3.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
          { url: '/apple-icon.png' },
          { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        other: [
          {
            rel: 'apple-touch-icon-precomposed',
            url: '/apple-icon.png',
          },
        ],
      },
      manifest: '/site.webmanifest',
      verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-verification-code',
        other: {
          'msvalidate.01': 'your-bing-verification-code',
          'facebook-domain-verification': 'your-facebook-verification-code',
          'p:domain_verify': 'your-pinterest-verification-code',
        },
      },
      other: {
        // Article-specific meta tags
        'article:author': 'Jason',
        'article:publisher': 'https://bee.whoisjason.me',
        'article:published_time': post.created,
        'article:modified_time': post.updated || post.created,
        'article:tag': allKeywords.join(', '),
        'article:section': 'Technology',
        'article:opinion': 'false',
        
        // Additional SEO meta tags
        'theme-color': '#E9D4BA',
        'color-scheme': 'light dark',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': 'BeeBlog',
        'application-name': 'BeeBlog',
        'msapplication-TileColor': '#E9D4BA',
        'msapplication-config': '/browserconfig.xml',
        
        // Content and language tags
        'content-language': 'en-US',
        'content-type': 'text/html; charset=utf-8',
        'distribution': 'global',
        'rating': 'general',
        'revisit-after': '7 days',
        
        // Social media meta tags
        'og:email': 'contact@bee.whoisjason.me',
        'og:phone_number': '+1-555-123-4567',
        'og:fax_number': '+1-555-123-4568',
        'og:latitude': '37.7749',
        'og:longitude': '-122.4194',
        'og:street-address': '123 Tech Street',
        'og:locality': 'San Francisco',
        'og:region': 'CA',
        'og:postal-code': '94102',
        'og:country-name': 'USA',
        
        // Business/Schema related
        'business:contact_data:street_address': '123 Tech Street',
        'business:contact_data:locality': 'San Francisco',
        'business:contact_data:region': 'CA',
        'business:contact_data:postal_code': '94102',
        'business:contact_data:country_name': 'USA',
        
        // News and content tags
        'news_keywords': allKeywords.slice(0, 10).join(', '),
        'standout': url,
        
        // Geo tags
        'geo.region': 'US-CA',
        'geo.placename': 'San Francisco',
        'geo.position': '37.7749;-122.4194',
        'ICBM': '37.7749, -122.4194',
        
        // Additional indexing hints
        'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'googlebot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        'bingbot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        
        // Content freshness
        'last-modified': post.updated || post.created,
        'cache-control': 'public, max-age=31536000',
        
        // Reading time and content metrics
        'reading-time': post.reading_time_minutes ? `${post.reading_time_minutes} minutes` : '5 minutes',
        'word-count': post.reading_time_minutes ? Math.round(post.reading_time_minutes * 200) : '1000',
        
        // Social sharing optimization
        'twitter:domain': 'bee.whoisjason.me',
        'twitter:url': url,
        'twitter:label1': 'Reading time',
        'twitter:data1': post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '5 min read',
        'twitter:label2': 'Written by',
        'twitter:data2': 'Jason',
        
        // Pinterest specific
        'pin:description': description,
        'pin:media': imageUrl,
        
        // LinkedIn specific
        'linkedin:owner': 'your-linkedin-profile',
        
        // Additional structured data hints
        'microdata': 'BlogPosting',
        'breadcrumb': 'Home > Blog Posts > ' + title,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post Not Found | BeeBlog',
      description: 'The requested blog post could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function BlogPost({ params }) {
  try {
    const resolvedParams = await params;
    const post = await pb.collection('posts').getOne(resolvedParams.id);
    
    // Increment view counter (this will happen on each page load)
    await pb.collection('posts').update(resolvedParams.id, {
      views: (post.views || 0) + 1
    });

    return <BlogPostClient post={post} params={resolvedParams} />;
  } catch (error) {
    console.error('Error fetching post:', error);
    return notFound();
  }
}
