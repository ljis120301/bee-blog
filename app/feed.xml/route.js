import { pb } from '@/lib/pocketbase';

// RSS 2.0 Feed Generator for BeeBlog
// This route generates a standard RSS feed that can be consumed by any RSS reader
// Uses the same PocketBase connection as the rest of the application

export async function GET() {
  try {
    // Fetch recent blog posts from PocketBase (same database connection as existing routes)
    const posts = await pb.collection('posts').getList(1, 50, {
      sort: '-created',
      fields: 'id,created,updated,title,description,dek,seo_title,seo_description,content,author,hero_image_url',
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
    const formatRssDate = (dateString) => {
      const date = new Date(dateString);
      return date.toUTCString();
    };

    // Generate RSS items from posts
    const rssItems = posts.items.map(post => {
      const postUrl = `https://bee.whoisjason.me/blogposts/${post.id}`;
      const title = escapeXml(post.seo_title || post.title);
      const description = escapeXml(
        post.seo_description || 
        post.description || 
        post.dek || 
        stripHtml(post.content).substring(0, 300) + '...'
      );
      const pubDate = formatRssDate(post.created);
      const imageUrl = post.hero_image_url ? escapeXml(post.hero_image_url) : '';
      
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
    <lastBuildDate>${formatRssDate(new Date().toISOString())}</lastBuildDate>
    <generator>BeeBlog Next.js RSS Generator</generator>
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

