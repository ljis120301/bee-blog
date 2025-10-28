import { useMemo } from 'react';

export default function SEOOptimizedContent({ post, children }) {
  // Calculate reading time for better user experience
  const estimatedReadingTime = useMemo(() => {
    if (!post?.content) return null;
    
    const wordsPerMinute = 200;
    const textContent = post.content.replace(/<[^>]*>/g, ''); // Strip HTML
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return readingTime;
  }, [post?.content]);

  // Extract first meaningful paragraph for better descriptions
  const extractExcerpt = useMemo(() => {
    if (!post?.content) return null;
    
    const textContent = post.content.replace(/<[^>]*>/g, ''); // Strip HTML
    const sentences = textContent.split(/[.!?]+/);
    const meaningfulSentences = sentences
      .filter(sentence => sentence.trim().length > 50)
      .slice(0, 2);
    
    return meaningfulSentences.join('. ').trim() + (meaningfulSentences.length > 0 ? '.' : '');
  }, [post?.content]);

  return (
    <article 
      itemScope 
      itemType="https://schema.org/BlogPosting"
      className="seo-optimized-content"
    >
      {/* Hidden metadata for search engines */}
      <meta itemProp="author" content="Jason" />
      <meta itemProp="publisher" content="BeeBlog" />
      <meta itemProp="datePublished" content={post?.created} />
      <meta itemProp="dateModified" content={post?.updated || post?.created} />
      <meta itemProp="headline" content={post?.seo_title || post?.title} />
      <meta itemProp="description" content={post?.seo_description || post?.description || extractExcerpt} />
      {post?.hero_image_url && <meta itemProp="image" content={post.hero_image_url} />}
      {estimatedReadingTime && <meta itemProp="timeRequired" content={`PT${estimatedReadingTime}M`} />}
      
      {children}
    </article>
  );
}
