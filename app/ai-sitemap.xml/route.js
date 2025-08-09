import { pb } from '@/lib/pocketbase';

export async function GET() {
  try {
    // Fetch all published blog posts
    const posts = await pb.collection('posts').getFullList({
      sort: '-created',
      fields: 'id,created,updated,title,seo_keywords,content,reading_time_minutes',
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
    const keywords = Array.isArray(post.seo_keywords) ? post.seo_keywords : [];
    const content = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
    const allTechEntities = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Swift', 'Kotlin',
      'PHP', 'Ruby', 'Scala', 'Perl', 'R', 'MATLAB', 'Objective-C', 'Dart', 'Elixir', 'Haskell',
      'Clojure', 'F#', 'VB.NET', 'COBOL', 'Fortran', 'Assembly', 'Shell', 'Bash', 'PowerShell',
      
      // Web Technologies
      'HTML', 'HTML5', 'CSS', 'CSS3', 'SCSS', 'SASS', 'React', 'Vue', 'Angular', 'Svelte',
      'Next.js', 'Nuxt.js', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel',
      'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Styled Components',
      
      // Backend & Databases
      'Node.js', 'Deno', 'Bun', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'Firebase', 'Supabase', 'PlanetScale', 'Prisma', 'GraphQL', 'REST API',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions',
      'GitLab CI', 'CircleCI', 'Heroku', 'Netlify', 'Vercel', 'DigitalOcean',
      
      // Mobile & Cross-Platform
      'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Expo', 'Android', 'iOS', 'PWA',
      
      // Testing & Quality
      'Jest', 'Cypress', 'Playwright', 'Selenium', 'JUnit', 'PyTest', 'ESLint', 'Prettier',
      
      // Data Science & AI
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Jupyter', 'Machine Learning', 'AI',
      'OpenAI', 'GPT', 'ChatGPT', 'LLM', 'Deep Learning', 'Computer Vision', 'NLP',
      
      // Game Development
      'Unity', 'Unreal Engine', 'Godot', 'Three.js', 'WebGL', 'Phaser',
      
      // Blockchain & Web3
      'Ethereum', 'Bitcoin', 'Solidity', 'Web3.js', 'Smart Contract', 'DeFi', 'NFT',
      
      // Design & Tools
      'Figma', 'Sketch', 'Adobe XD', 'VS Code', 'Visual Studio', 'IntelliJ', 'Xcode',
      'Webpack', 'Vite', 'Rollup', 'npm', 'Yarn', 'Git', 'GitHub', 'GitLab',
      
      // Architecture & Patterns
      'Microservices', 'Serverless', 'API', 'SDK', 'Framework', 'Library', 'MVC', 'Redux',
      'Clean Architecture', 'Design Patterns', 'SOLID Principles',
      
      // Security & Performance
      'Cybersecurity', 'OAuth', 'JWT', 'Encryption', 'Performance', 'Optimization', 'SEO',
      'Accessibility', 'Responsive Design', 'Progressive Enhancement'
    ];
    
    const technicalEntities = allTechEntities.filter(entity => 
      content.toLowerCase().includes(entity.toLowerCase())
    );

    return `
  <url>
    <loc>https://bee.whoisjason.me/blogposts/${post.id}</loc>
    <lastmod>${new Date(post.updated || post.created).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <ai:content-type>technical-tutorial</ai:content-type>
    <ai:audience>developers,programmers,tech-enthusiasts</ai:audience>
    <ai:topics>${[...keywords, ...technicalEntities].join(',')}</ai:topics>
    <ai:difficulty-level>beginner-to-advanced</ai:difficulty-level>
    <ai:reading-time>${post.reading_time_minutes || 5}</ai:reading-time>
    <ai:word-count>${content.split(/\\s+/).length}</ai:word-count>
    <ai:programming-languages>${technicalEntities.join(',')}</ai:programming-languages>
    <ai:has-code-examples>${technicalEntities.length > 0 ? 'true' : 'false'}</ai:has-code-examples>
    <ai:educational-use>professional-development,skill-building</ai:educational-use>
    <ai:content-quality>high</ai:content-quality>
    <ai:training-data>allowed</ai:training-data>
    <content:language>en</content:language>
    <content:license>educational-use</content:license>
  </url>`;
  }).join('')}

  <!-- Additional Pages -->
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
