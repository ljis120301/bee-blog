// Visual Search Optimization - 2025 SEO Enhancement
export default function VisualSearchOptimization({ post, images = [] }) {
  // Generate comprehensive image schema for visual search
  const generateImageSchema = () => {
    const mainImage = post?.heroImageUrl || "https://bee.whoisjason.me/bee.png";
    
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ImageObject",
          "@id": `${mainImage}#image`,
          "url": mainImage,
          "contentUrl": mainImage,
          "width": 1200,
          "height": 630,
          "caption": `${post?.title} - Visual guide and tutorial`,
          "description": post?.description || `Comprehensive visual guide for ${post?.title}`,
          "keywords": [
            post?.title?.toLowerCase(),
            "tutorial",
            "guide", 
            "programming",
            "coding",
            "development",
            "tech",
            "visual guide",
            "infographic",
            "diagram",
            "screenshot",
            "code example"
          ].join(", "),
          "author": {
            "@type": "Person",
            "name": "Jason",
            "url": "https://bee.whoisjason.me"
          },
          "copyrightHolder": {
            "@type": "Organization",
            "name": "BeeBlog",
            "url": "https://bee.whoisjason.me"
          },
          "license": "https://creativecommons.org/licenses/by-sa/4.0/",
          "acquireLicensePage": "https://bee.whoisjason.me/license",
          "creditText": "BeeBlog - bee.whoisjason.me",
          "creator": {
            "@type": "Person", 
            "name": "Jason"
          },
          "representativeOfPage": true,
          "thumbnail": {
            "@type": "ImageObject",
            "url": mainImage.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.$1'),
            "width": 300,
            "height": 157
          }
        },
        // Additional images if provided
        ...images.map((img, index) => ({
          "@type": "ImageObject",
          "@id": `${img.url}#image-${index}`,
          "url": img.url,
          "contentUrl": img.url,
          "caption": img.caption || `${post?.title} - Example ${index + 1}`,
          "description": img.description || `Visual example for ${post?.title}`,
          "keywords": [
            post?.title?.toLowerCase(),
            "example",
            "demonstration",
            "visual",
            "code",
            "implementation"
          ].join(", "),
          "author": {
            "@type": "Person",
            "name": "Jason"
          },
          "isPartOf": {
            "@type": "Article",
            "url": `https://bee.whoisjason.me/blogposts/${post?.id}`
          }
        }))
      ]
    };
  };

  // Generate video schema if applicable
  const generateVideoSchema = () => {
    if (!post?.videoUrl) return null;

    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": `${post.title} - Video Tutorial`,
      "description": `Video explanation of ${post.title}`,
      "thumbnailUrl": post.heroImageUrl || "https://bee.whoisjason.me/bee.png",
      "uploadDate": post.publishedDate || new Date().toISOString(),
      "duration": "PT10M",
      "contentUrl": post.videoUrl,
      "embedUrl": post.videoEmbedUrl || post.videoUrl,
      "author": {
        "@type": "Person",
        "name": "Jason"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BeeBlog",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bee.whoisjason.me/bee.png"
        }
      }
    };
  };

  return (
    <>
      {/* Image Schema for Visual Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateImageSchema(), null, 2) }}
      />

      {/* Video Schema if applicable */}
      {post?.videoUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateVideoSchema(), null, 2) }}
        />
      )}

      {/* Visual Search Meta Tags */}
      <meta name="visual-search-optimized" content="true" />
      <meta name="image-recognition-ready" content="true" />
      <meta name="visual-content-type" content="educational,tutorial,infographic" />
      <meta name="image-search-keywords" content={`${post?.title}, tutorial, programming, coding, development, tech guide`} />
      <meta name="visual-learning-content" content="true" />
      <meta name="diagram-content" content="true" />
      <meta name="screenshot-content" content="true" />
      <meta name="infographic-content" content="true" />
      <meta name="visual-examples" content="true" />
      <meta name="code-visualization" content="true" />
      
      {/* Pinterest-specific optimization */}
      <meta name="pinterest-rich-pin" content="article" />
      <meta name="pinterest-media-copyright" content="BeeBlog" />
      
      {/* Instagram and social visual optimization */}
      <meta name="instagram-media-type" content="image" />
      <meta name="social-visual-content" content="optimized" />
      
      {/* Google Images optimization */}
      <meta name="google-images-compatible" content="true" />
      <meta name="image-content-type" content="educational" />
      <meta name="visual-search-category" content="technology,programming,education" />
      
      {/* Bing Visual Search optimization */}
      <meta name="bing-visual-search" content="enabled" />
      <meta name="visual-content-quality" content="high" />
      
      {/* TikTok and short-form video optimization */}
      <meta name="short-form-video-ready" content="true" />
      <meta name="vertical-video-optimized" content="true" />
      <meta name="mobile-video-friendly" content="true" />

      {/* Hidden microdata for visual content */}
      <div itemScope itemType="https://schema.org/ImageObject" style={{display: 'none'}}>
        <meta itemProp="url" content={post?.heroImageUrl || "https://bee.whoisjason.me/bee.png"} />
        <meta itemProp="caption" content={`${post?.title} - Visual tutorial and guide`} />
        <meta itemProp="description" content={post?.description || `Visual guide for ${post?.title}`} />
        <meta itemProp="keywords" content={`${post?.title}, tutorial, visual guide, programming, coding`} />
        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content="Jason" />
        </span>
        <span itemProp="copyrightHolder" itemScope itemType="https://schema.org/Organization">
          <meta itemProp="name" content="BeeBlog" />
        </span>
      </div>

      {/* Alt text optimization hints for images */}
      <div data-visual-search-hints style={{display: 'none'}}>
        <div data-alt-pattern="screenshot">
          Screenshot showing {post?.title} implementation with code examples and UI elements
        </div>
        <div data-alt-pattern="diagram">
          Technical diagram illustrating {post?.title} architecture and data flow
        </div>
        <div data-alt-pattern="code">
          Code example demonstrating {post?.title} with syntax highlighting and annotations
        </div>
        <div data-alt-pattern="ui">
          User interface design for {post?.title} application with navigation and controls
        </div>
        <div data-alt-pattern="flowchart">
          Flowchart showing the step-by-step process for implementing {post?.title}
        </div>
      </div>
    </>
  );
}

// Export visual search optimization strategies
export const VISUAL_SEARCH_STRATEGIES = {
  imageOptimization: [
    'high-quality-images',
    'descriptive-filenames',
    'comprehensive-alt-text',
    'image-captions',
    'structured-data-markup',
    'responsive-images',
    'webp-format',
    'lazy-loading',
    'image-compression',
    'cdn-delivery'
  ],
  contentTypes: [
    'screenshots',
    'diagrams',
    'infographics', 
    'code-visualizations',
    'architecture-diagrams',
    'flowcharts',
    'ui-mockups',
    'before-after-comparisons',
    'step-by-step-visuals',
    'annotated-examples'
  ],
  platforms: [
    'google-images',
    'google-lens',
    'bing-visual-search',
    'pinterest-visual-search',
    'instagram-search',
    'tiktok-discovery',
    'youtube-thumbnails',
    'linkedin-images',
    'twitter-images',
    'facebook-images'
  ]
};

// Alt text generation patterns for different image types
export const generateAltText = (imageType, topic, context = '') => {
  const patterns = {
    screenshot: `Screenshot of ${topic} ${context} showing the user interface and implementation details`,
    diagram: `Technical diagram illustrating ${topic} architecture, components, and data flow ${context}`,
    code: `Code example for ${topic} ${context} with syntax highlighting and detailed implementation`,
    ui: `User interface design for ${topic} application ${context} featuring modern UX patterns`,
    flowchart: `Flowchart showing the ${topic} process ${context} with decision points and workflows`,
    infographic: `Infographic explaining ${topic} concepts ${context} with visual elements and data`,
    comparison: `Side-by-side comparison of ${topic} approaches ${context} highlighting differences`,
    tutorial: `Step-by-step tutorial image for ${topic} ${context} with annotations and explanations`,
    example: `Practical example of ${topic} implementation ${context} demonstrating best practices`,
    result: `Output result of ${topic} execution ${context} showing expected outcomes and data`
  };

  return patterns[imageType] || `Visual content related to ${topic} ${context}`;
};
