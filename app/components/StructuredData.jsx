export default function StructuredData({ post, type = 'website' }) {
  if (type === 'blogPost' && post) {
    const keywords = Array.isArray(post.seo_keywords) ? post.seo_keywords : ['coding', 'programming', 'tech', 'web development'];
    
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `https://bee.whoisjason.me/blogposts/${post.id}#blogpost`,
          "headline": post.seo_title || post.title,
          "description": post.seo_description || post.description || post.dek,
          "image": {
            "@type": "ImageObject",
            "url": post.hero_image_url || "https://bee.whoisjason.me/og-default.jpg",
            "width": 1200,
            "height": 630,
            "caption": post.title
          },
          "author": {
            "@type": "Person",
            "@id": "https://bee.whoisjason.me/about#person",
            "name": "Jason",
            "url": "https://bee.whoisjason.me/about",
            "jobTitle": "Software Developer",
            "worksFor": {
              "@type": "Organization",
              "name": "BeeBlog"
            },
            "sameAs": [
              "https://twitter.com/your_twitter_handle",
              "https://github.com/your_github",
              "https://linkedin.com/in/your_linkedin",
              "https://instagram.com/your_instagram",
              "https://youtube.com/your_youtube",
              "https://tiktok.com/@your_tiktok",
              "https://reddit.com/user/your_reddit"
            ],
            "knowsAbout": keywords
          },
          "publisher": {
            "@type": "Organization",
            "@id": "https://bee.whoisjason.me#organization",
            "name": "BeeBlog",
            "description": "Your hive for coding insights, tech trends, and sweet development tips",
            "logo": {
              "@type": "ImageObject",
              "url": "https://bee.whoisjason.me/bee-icon.ico",
              "width": 60,
              "height": 60
            },
            "url": "https://bee.whoisjason.me",
            "sameAs": [
              "https://twitter.com/ljis120301",
              "https://facebook.com/ljis1203",
              "https://linkedin.com/in/ljis120301",
              "https://instagram.com/ljis1203",
              "https://youtube.com/c/ljis120301",
              "https://tiktok.com/@ljis120301",
              "https://reddit.com/r/ljis120301"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-123-4567",
              "contactType": "customer service",
              "email": "support@whoisjason.me"
            }
          },
          "datePublished": post.created,
          "dateModified": post.updated || post.created,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://bee.whoisjason.me/blogposts/${post.id}`
          },
          "keywords": keywords.join(', '),
          "articleSection": "Technology",
          "articleBody": post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 500) + '...' : '',
          "wordCount": post.reading_time_minutes ? Math.round(post.reading_time_minutes * 200) : 1000,
          "timeRequired": post.reading_time_minutes ? `PT${post.reading_time_minutes}M` : "PT5M",
          "url": `https://bee.whoisjason.me/blogposts/${post.id}`,
          "isPartOf": {
            "@type": "Blog",
            "@id": "https://bee.whoisjason.me#blog",
            "name": "BeeBlog",
            "url": "https://bee.whoisjason.me",
            "description": "Your hive for coding insights, tech trends, and sweet development tips.",
            "publisher": {
              "@id": "https://bee.whoisjason.me#organization"
            }
          },
          "inLanguage": "en-US",
          "potentialAction": [
            {
              "@type": "ReadAction",
              "target": `https://bee.whoisjason.me/blogposts/${post.id}`
            },
            {
              "@type": "ShareAction",
              "target": `https://bee.whoisjason.me/blogposts/${post.id}`
            },
            {
              "@type": "CommentAction",
              "target": `https://bee.whoisjason.me/blogposts/${post.id}#comments`
            }
          ],
          "about": keywords.map(keyword => ({
            "@type": "Thing",
            "name": keyword
          })),
          "teaches": keywords.slice(0, 5),
          "educationalLevel": "Beginner to Advanced",
          "learningResourceType": "Article",
          "typicalAgeRange": "18-99",
          "interactivityType": "expositive",
          "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "student",
            "audienceType": "Developers, Programmers, Tech Enthusiasts"
          }
        },
        {
          "@type": "Person",
          "@id": "https://bee.whoisjason.me/about#person",
          "name": "Jason",
          "givenName": "Jason",
          "jobTitle": "Software Developer & Tech Content Creator",
          "description": "Experienced software developer sharing coding insights and tech knowledge through BeeBlog",
          "url": "https://bee.whoisjason.me/about",
          "image": "https://bee.whoisjason.me/author-photo.jpg",
          "sameAs": [
            "https://twitter.com/your_twitter_handle",
            "https://github.com/your_github",
            "https://linkedin.com/in/your_linkedin"
          ],
          "knowsAbout": keywords,
          "hasOccupation": {
            "@type": "Occupation",
            "name": "Software Developer",
            "occupationLocation": {
              "@type": "City",
              "name": "San Francisco"
            }
          }
        },
        {
          "@type": "WebPage",
          "@id": `https://bee.whoisjason.me/blogposts/${post.id}`,
          "url": `https://bee.whoisjason.me/blogposts/${post.id}`,
          "name": post.title,
          "description": post.seo_description || post.description || post.dek,
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://bee.whoisjason.me#website"
          },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": post.hero_image_url || "https://bee.whoisjason.me/og-default.jpg"
          },
          "datePublished": post.created,
          "dateModified": post.updated || post.created,
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://bee.whoisjason.me"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog Posts",
                "item": "https://bee.whoisjason.me/blogposts"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://bee.whoisjason.me/blogposts/${post.id}`
              }
            ]
          }
        }
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
      />
    );
  }

  if (type === 'website') {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BeeBlog",
      "alternateName": [
        "Bee Blog - Buzzing with Code and Tech",
        "BeeBlog",
        "Bee Blog",
        "Jason's Bee Blog",
        "Jason Bee Blog",
        "Jason's Tech Blog",
        "Jason Coding Blog",
        "Jason Programming Blog",
        "Who Is Jason Blog",
        "WhoisJason Blog",
        "Bee Coding",
        "Bee Programming",
        "Bee Developer Blog",
        "Bee Software Blog",
        "Bee Web Development",
        "Jason's Development Blog"
      ],
      "description": "Your hive for coding insights, tech trends, and sweet development tips. Join our community of busy bees buzzing with knowledge!",
      "url": "https://bee.whoisjason.me",
      "mainEntityOfPage": "https://bee.whoisjason.me",
      "sameAs": [
        "https://bee.whoisjason.me",
        "https://bee.whoisjason.me/blogposts",
        "https://bee.whoisjason.me/about",
        "https://bee.whoisjason.me/favorites"
      ],
      "identifier": [
        {
          "@type": "PropertyValue",
          "name": "Domain",
          "value": "bee.whoisjason.me"
        },
        {
          "@type": "PropertyValue", 
          "name": "Brand",
          "value": "BeeBlog"
        },
        {
          "@type": "PropertyValue",
          "name": "Author",
          "value": "Jason"
        },
        {
          "@type": "PropertyValue",
          "name": "Content-Type",
          "value": "Technology Blog"
        }
      ],
      "keywords": [
        "bee blog", "beeblog", "jason blog", "coding blog", "programming blog",
        "tech blog", "web development", "javascript", "react", "nextjs",
        "tutorials", "guides", "how-to", "programming tutorials", "coding tips",
        "development tips", "software engineering", "computer science",
        "frontend", "backend", "fullstack", "developer resources",
        "bee.whoisjason.me", "whoisjason", "jason coding", "jason programming"
      ],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://bee.whoisjason.me/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BeeBlog",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bee.whoisjason.me/bee-icon.ico",
          "width": 60,
          "height": 60
        },
        "url": "https://bee.whoisjason.me",
        "sameAs": [
          "https://twitter.com/your_twitter_handle",
          "https://github.com/your_github"
        ]
      },
      "inLanguage": "en-US",
      "copyrightYear": new Date().getFullYear(),
      "copyrightHolder": {
        "@type": "Person",
        "name": "Jason"
      }
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
      />
    );
  }

  if (type === 'breadcrumb' && post) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://bee.whoisjason.me"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog Posts",
          "item": "https://bee.whoisjason.me/blogposts"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `https://bee.whoisjason.me/blogposts/${post.id}`
        }
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
      />
    );
  }

  return null;
}
