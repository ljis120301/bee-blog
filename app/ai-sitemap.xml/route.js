import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all published blog posts from Prisma
    const posts = await db.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        seoKeywords: true,
        content: true,
        readingTimeMinutes: true,
      },
    });

    // Generate AI-optimized sitemap
    const aiSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:ai="http://www.google.com/schemas/sitemap-ai/1.0"
        xmlns:content="http://www.google.com/schemas/sitemap-content/1.0">
  
  <!-- Main Pages -->
  <url>
    <loc>https://bee.whoisjason.me/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <ai:content-type>homepage</ai:content-type>
    <ai:audience>developers</ai:audience>
    <content:language>en</content:language>
  </url>
  
  <url>
    <loc>https://bee.whoisjason.me/blogposts</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <ai:content-type>article-listing</ai:content-type>
    <ai:audience>developers</ai:audience>
    <content:language>en</content:language>
  </url>

  <!-- Blog Posts with AI Metadata -->
  ${posts.map((post) => {
      const keywords = post.seoKeywords ? JSON.parse(post.seoKeywords) : [];
      const content = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
      const techKeywords = ['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
        'CSS', 'HTML', 'API', 'Database', 'Frontend', 'Backend', 'DevOps', 'Docker', 'Kubernetes'];
      const technicalEntities = techKeywords.filter(entity =>
        content.toLowerCase().includes(entity.toLowerCase())
      );

      return `
  <url>
    <loc>https://bee.whoisjason.me/blogposts/${post.id}</loc>
    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <ai:content-type>technical-tutorial</ai:content-type>
    <ai:audience>developers,programmers,tech-enthusiasts</ai:audience>
    <ai:topics>${[...keywords, ...technicalEntities].join(',')}</ai:topics>
    <ai:difficulty-level>beginner-to-advanced</ai:difficulty-level>
    <ai:reading-time>${post.readingTimeMinutes || 5}</ai:reading-time>
    <ai:has-code-examples>${technicalEntities.length > 0 ? 'true' : 'false'}</ai:has-code-examples>
    <content:language>en</content:language>
  </url>`;
    }).join('')}

  <url>
    <loc>https://bee.whoisjason.me/auth</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <ai:content-type>authentication</ai:content-type>
    <content:language>en</content:language>
  </url>

</urlset>`;

    return new Response(aiSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error generating AI sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
