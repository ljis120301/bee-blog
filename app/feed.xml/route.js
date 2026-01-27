import { db } from '@/lib/db';

// RSS 2.0 Feed Generator for BeeBlog
// This route generates a standard RSS feed using Prisma/SQLite

export async function GET() {
  try {
    // Fetch recent blog posts from Prisma
    const posts = await db.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        description: true,
        dek: true,
        seoTitle: true,
        seoDescription: true,
        content: true,
        heroImageUrl: true,
      },
    });

    // Helper function to escape XML special characters
    const escapeXml = (unsafe) => {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Helper function to strip HTML tags and create plain text description
    const stripHtml = (html) => {
      if (!html) return '';
      return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Helper function to format dates in RFC 822 format (required by RSS 2.0)
    const formatRssDate = (date) => {
      return new Date(date).toUTCString();
    };

    // Generate RSS items from posts
    const rssItems = posts.map(post => {
      const postUrl = `https://bee.whoisjason.me/blogposts/${post.id}`;
      const title = escapeXml(post.seoTitle || post.title);
      const description = escapeXml(
        post.seoDescription ||
        post.description ||
        post.dek ||
        stripHtml(post.content).substring(0, 300) + '...'
      );
      const pubDate = formatRssDate(post.createdAt);
      const imageUrl = post.heroImageUrl ? escapeXml(post.heroImageUrl) : '';

      // Create content with description and optional image
      let contentHtml = `<p>${description}</p>`;
      if (imageUrl) {
        contentHtml = `<img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto;" />${contentHtml}`;
      }

      return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${description}</description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ''}
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
      <author>contact@bee.whoisjason.me (Jason)</author>
      <category>Technology</category>
      <category>Programming</category>
      <category>Web Development</category>
    </item>`;
    }).join('\n');

    // Generate complete RSS 2.0 feed with all required and optional elements
    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>BeeBlog - Buzzing with Code and Tech</title>
    <link>https://bee.whoisjason.me</link>
    <description>Your hive for coding insights, tech trends, and sweet development tips. Expert tutorials, programming guides, and cutting-edge technology insights.</description>
    <language>en-US</language>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <generator>BeeBlog Next.js RSS Generator (Prisma)</generator>
    <copyright>© 2024 BeeBlog. All rights reserved.</copyright>
    <managingEditor>contact@bee.whoisjason.me (Jason)</managingEditor>
    <webMaster>contact@bee.whoisjason.me (Jason)</webMaster>
    <category>Technology</category>
    <category>Programming</category>
    <category>Web Development</category>
    <category>Software Engineering</category>
    <category>Coding Tutorials</category>
    <image>
      <url>https://bee.whoisjason.me/bee-icon3.png</url>
      <title>BeeBlog</title>
      <link>https://bee.whoisjason.me</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="https://bee.whoisjason.me/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

    // Return RSS feed with proper content type and caching headers
    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
        'X-Robots-Tag': 'index, follow',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);

    // Return error response in XML format
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BeeBlog - Feed Error</title>
    <link>https://bee.whoisjason.me</link>
    <description>Unable to generate feed. Please try again later.</description>
  </channel>
</rss>`;

    return new Response(errorFeed, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });
  }
}
