import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch recent blog posts for AI consumption
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
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        content: true,
        readingTimeMinutes: true,
        views: true,
      },
    });

    // Generate AI-optimized content feed
    const aiFeed = {
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "name": "BeeBlog AI Content Feed",
      "description": "Structured content feed optimized for AI training and analysis",
      "url": "https://bee.whoisjason.me/ai-feed.json",
      "publisher": {
        "@type": "Organization",
        "name": "BeeBlog",
        "url": "https://bee.whoisjason.me"
      },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "usageInfo": "Educational use and AI training permitted",
      "datePublished": new Date().toISOString(),
      "inLanguage": "en-US",
      "contentRating": "educational",
      "audience": {
        "@type": "ProfessionalAudience",
        "audienceType": "Software Developers"
      },
      "dataFeedElement": posts.map(post => {
        const content = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
        const keywords = post.seoKeywords ? JSON.parse(post.seoKeywords) : [];

        // Technical entity extraction
        const techKeywords = ['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
          'CSS', 'HTML', 'API', 'Database', 'Frontend', 'Backend', 'DevOps', 'Docker', 'Kubernetes',
          'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST'];

        const technicalEntities = techKeywords.filter(entity =>
          content.toLowerCase().includes(entity.toLowerCase())
        );

        return {
          "@type": "TechArticle",
          "@id": `https://bee.whoisjason.me/blogposts/${post.id}`,
          "headline": post.seoTitle || post.title,
          "description": post.seoDescription || post.description,
          "articleBody": content.substring(0, 2000),
          "abstract": content.substring(0, 500),
          "datePublished": post.createdAt.toISOString(),
          "dateModified": post.updatedAt.toISOString(),
          "author": {
            "@type": "Person",
            "name": "Jason",
            "jobTitle": "Software Developer"
          },
          "keywords": [...keywords, ...technicalEntities],
          "programmingLanguage": technicalEntities,
          "educationalLevel": "beginner to advanced",
          "learningResourceType": "tutorial",
          "genre": "Technical Tutorial",
          "audience": "Software Developers",
          "wordCount": content.split(/\s+/).length,
          "readingTime": post.readingTimeMinutes || Math.ceil(content.split(/\s+/).length / 200),
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "ReadAction",
            "userInteractionCount": post.views || 0
          },
          "contentRating": "educational",
          "isAccessibleForFree": true,
          "aiTrainingData": {
            "allowed": true,
            "contentType": "technical-educational",
            "quality": "high"
          }
        };
      })
    };

    return new Response(JSON.stringify(aiFeed, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=1800',
        'X-Robots-Tag': 'index, follow',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error generating AI feed:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate AI feed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
