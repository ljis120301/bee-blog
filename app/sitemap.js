import { db } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = 'https://bee.whoisjason.me';

  // Static pages with optimized priorities and change frequencies
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blogposts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/user-profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/change-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

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
        slug: true,
      },
    });

    const blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blogposts/${post.id}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...blogPosts];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages even if blog posts fail to load
    return staticPages;
  }
}
