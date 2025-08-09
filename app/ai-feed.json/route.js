import { pb } from '@/lib/pocketbase';

export async function GET() {
  try {
    // Fetch recent blog posts for AI consumption
    const posts = await pb.collection('posts').getList(1, 50, {
      sort: '-created',
      fields: 'id,created,updated,title,description,seo_title,seo_description,seo_keywords,content,reading_time_minutes,views',
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
      "dataFeedElement": posts.items.map(post => {
        const content = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
        const keywords = Array.isArray(post.seo_keywords) ? post.seo_keywords : [];
        
        // Comprehensive technical entity extraction covering entire tech ecosystem
        const allTechEntities = [
          // Core Programming Languages
          'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Swift', 'Kotlin',
          'PHP', 'Ruby', 'Scala', 'Perl', 'R', 'MATLAB', 'Objective-C', 'Dart', 'Elixir', 'Haskell',
          'Clojure', 'F#', 'VB.NET', 'COBOL', 'Fortran', 'Assembly', 'Shell', 'Bash', 'PowerShell',
          'Lua', 'Julia', 'Groovy', 'Erlang', 'OCaml', 'Nim', 'Crystal', 'Zig', 'V', 'D',
          
          // Web Technologies & Frameworks
          'HTML', 'HTML5', 'CSS', 'CSS3', 'SCSS', 'SASS', 'Less', 'Stylus', 'PostCSS',
          'React', 'Vue', 'Vue.js', 'Angular', 'Svelte', 'SvelteKit', 'Solid.js', 'Lit', 'Stencil',
          'Next.js', 'Nuxt.js', 'Gatsby', 'Remix', 'Astro', 'SolidStart', 'Fresh',
          'Express.js', 'Fastify', 'Koa', 'Hapi', 'NestJS', 'Django', 'Flask', 'FastAPI',
          'Spring Boot', 'Spring Framework', 'Laravel', 'Symfony', 'CodeIgniter', 'Ruby on Rails',
          'ASP.NET', 'ASP.NET Core', '.NET', 'Blazor', 'Phoenix', 'Gin', 'Echo', 'Fiber',
          
          // Styling & UI Libraries
          'Tailwind CSS', 'Bootstrap', 'Bulma', 'Foundation', 'Chakra UI', 'Material-UI', 'Ant Design',
          'Mantine', 'Styled Components', 'Emotion', 'CSS Modules', 'CSS-in-JS', 'Sass', 'PostCSS',
          
          // Runtime Environments
          'Node.js', 'Deno', 'Bun', 'V8', 'SpiderMonkey', 'Chakra', 'JVM', 'CLR', '.NET Framework',
          
          // Databases & Data Storage
          'MySQL', 'PostgreSQL', 'SQLite', 'MariaDB', 'Oracle', 'SQL Server', 'MongoDB', 'CouchDB',
          'Redis', 'Memcached', 'Elasticsearch', 'Solr', 'Neo4j', 'ArangoDB', 'DynamoDB', 'Firebase',
          'Firestore', 'Supabase', 'PlanetScale', 'Neon', 'Railway', 'Cockroach DB', 'InfluxDB',
          'TimescaleDB', 'ClickHouse', 'Cassandra', 'HBase', 'RethinkDB', 'FaunaDB', 'EdgeDB',
          
          // Cloud Platforms & Services
          'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP', 'Google Cloud Platform',
          'IBM Cloud', 'Oracle Cloud', 'Alibaba Cloud', 'DigitalOcean', 'Linode', 'Vultr', 'Hetzner',
          'Heroku', 'Netlify', 'Vercel', 'Railway', 'Render', 'Fly.io', 'Cloudflare', 'Fastly',
          
          // DevOps & Infrastructure
          'Docker', 'Kubernetes', 'K8s', 'Helm', 'Istio', 'Linkerd', 'Consul', 'Vault', 'Nomad',
          'Terraform', 'Pulumi', 'CloudFormation', 'Ansible', 'Chef', 'Puppet', 'SaltStack',
          'Jenkins', 'GitLab CI', 'GitHub Actions', 'Azure DevOps', 'CircleCI', 'Travis CI',
          'TeamCity', 'Bamboo', 'Drone', 'Tekton', 'Argo CD', 'Flux', 'Spinnaker',
          
          // Version Control & Collaboration
          'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Azure Repos', 'SourceForge', 'SVN', 'Mercurial',
          'Perforce', 'TFS', 'Bazaar', 'Fossil', 'Git Flow', 'GitHub Flow', 'GitLab Flow',
          
          // Testing & Quality Assurance
          'Jest', 'Mocha', 'Jasmine', 'Karma', 'Protractor', 'Cypress', 'Playwright', 'Puppeteer',
          'Selenium', 'WebDriver', 'TestCafe', 'Nightwatch', 'Detox', 'Appium', 'Espresso', 'XCTest',
          'JUnit', 'TestNG', 'Mockito', 'WireMock', 'PyTest', 'unittest', 'RSpec', 'PHPUnit',
          'MSTest', 'NUnit', 'xUnit', 'SpecFlow', 'Postman', 'Insomnia', 'Newman', 'K6', 'Artillery',
          
          // Mobile Development
          'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'NativeScript',
          'Expo', 'Capacitor', 'Tauri', 'Electron', 'PWA', 'Service Worker', 'WebAssembly', 'WASM',
          'Android', 'iOS', 'Kotlin Multiplatform', 'Swift UI', 'UIKit', 'Jetpack Compose',
          
          // Game Development
          'Unity', 'Unreal Engine', 'Godot', 'GameMaker Studio', 'Construct', 'RPG Maker',
          'Phaser', 'Three.js', 'Babylon.js', 'PlayCanvas', 'A-Frame', 'WebGL', 'OpenGL', 'Vulkan',
          'DirectX', 'Metal', 'HLSL', 'GLSL', 'Shader', 'Blender', 'Maya', 'Cinema 4D',
          
          // Data Science & AI/ML
          'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
          'Plotly', 'Jupyter', 'Anaconda', 'Spark', 'Hadoop', 'Kafka', 'Airflow', 'MLflow', 'Kubeflow',
          'H2O.ai', 'DataRobot', 'Weights & Biases', 'Neptune', 'Comet', 'DVC', 'Optuna', 'Ray',
          'OpenAI', 'GPT', 'ChatGPT', 'Claude', 'Bard', 'Gemini', 'LLM', 'Transformer', 'BERT',
          'GPT-3', 'GPT-4', 'Machine Learning', 'Deep Learning', 'Neural Network', 'CNN', 'RNN',
          'LSTM', 'GAN', 'Computer Vision', 'Natural Language Processing', 'NLP', 'Reinforcement Learning',
          
          // Blockchain & Web3
          'Ethereum', 'Bitcoin', 'Solidity', 'Web3.js', 'Ethers.js', 'Truffle', 'Hardhat', 'Ganache',
          'MetaMask', 'OpenZeppelin', 'IPFS', 'Smart Contract', 'DeFi', 'NFT', 'DAO', 'dApp',
          'Polygon', 'Binance Smart Chain', 'Cardano', 'Polkadot', 'Chainlink', 'Uniswap',
          
          // Design & UX/UI
          'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle', 'Framer', 'ProtoPie', 'Zeplin',
          'Abstract', 'Marvel', 'Balsamiq', 'Axure', 'Adobe Creative Suite', 'Photoshop', 'Illustrator',
          'User Experience', 'User Interface', 'Design System', 'Component Library', 'Style Guide',
          'Atomic Design', 'Material Design', 'Human Interface Guidelines', 'Accessibility', 'WCAG',
          
          // Development Tools & IDEs
          'VS Code', 'Visual Studio', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'PhpStorm', 'GoLand',
          'CLion', 'RubyMine', 'DataGrip', 'Rider', 'AppCode', 'Android Studio', 'Xcode',
          'Eclipse', 'NetBeans', 'Sublime Text', 'Atom', 'Vim', 'Neovim', 'Emacs', 'Nano',
          'Bracket', 'CodePen', 'JSFiddle', 'CodeSandbox', 'StackBlitz', 'Repl.it', 'Gitpod',
          
          // Build Tools & Package Managers
          'npm', 'Yarn', 'pnpm', 'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'SWC', 'Babel',
          'ESLint', 'Prettier', 'TSLint', 'JSHint', 'JSLint', 'Stylelint', 'Husky', 'lint-staged',
          'Maven', 'Gradle', 'SBT', 'Leiningen', 'Composer', 'Bundler', 'Gem', 'pip', 'conda',
          'Poetry', 'Pipenv', 'NuGet', 'Chocolatey', 'Homebrew', 'APT', 'YUM', 'DNF', 'Pacman',
          
          // Monitoring & Observability
          'Prometheus', 'Grafana', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'New Relic', 'Datadog',
          'Splunk', 'Elastic Stack', 'ELK Stack', 'Fluentd', 'Logstash', 'Kibana', 'Sentry',
          'Rollbar', 'Bugsnag', 'Honeycomb', 'Lightstep', 'PagerDuty', 'OpsGenie', 'VictorOps',
          
          // Architecture & Design Patterns
          'Microservices', 'Monolith', 'SOA', 'Event-Driven Architecture', 'CQRS', 'Event Sourcing',
          'Domain-Driven Design', 'DDD', 'Clean Architecture', 'Hexagonal Architecture', 'Onion Architecture',
          'MVC', 'MVP', 'MVVM', 'Flux', 'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Valtio',
          'Singleton', 'Factory', 'Observer', 'Strategy', 'Command', 'Decorator', 'Adapter', 'Facade',
          'Builder', 'Prototype', 'Chain of Responsibility', 'State', 'Template Method', 'Visitor',
          
          // Protocols & Standards
          'HTTP', 'HTTPS', 'HTTP/2', 'HTTP/3', 'WebSocket', 'WebRTC', 'gRPC', 'GraphQL', 'REST',
          'SOAP', 'XML-RPC', 'JSON-RPC', 'OAuth', 'OAuth2', 'OpenID Connect', 'SAML', 'JWT',
          'TCP', 'UDP', 'IP', 'DNS', 'SSL', 'TLS', 'SSH', 'FTP', 'SFTP', 'SMTP', 'IMAP', 'POP3',
          
          // Security & Authentication
          'Cybersecurity', 'Information Security', 'Application Security', 'Network Security',
          'Penetration Testing', 'Ethical Hacking', 'Bug Bounty', 'OWASP', 'SQL Injection', 'XSS',
          'CSRF', 'Security Audit', 'Vulnerability Assessment', 'Firewall', 'VPN', 'Zero Trust',
          'Multi-Factor Authentication', 'MFA', '2FA', 'Biometric Authentication', 'Encryption',
          'Cryptography', 'Hash Function', 'Digital Signature', 'Certificate Authority', 'PKI',
          'Auth0', 'Okta', 'Firebase Auth', 'AWS Cognito', 'Azure AD', 'Keycloak', 'Passport.js',
          
          // General Tech Concepts & Methodologies
          'API', 'SDK', 'Framework', 'Library', 'Module', 'Package', 'Component', 'Service',
          'Microservice', 'Serverless', 'Lambda', 'Function as a Service', 'FaaS', 'PaaS', 'SaaS', 'IaaS',
          'Edge Computing', 'CDN', 'Load Balancer', 'Reverse Proxy', 'Cache', 'Session', 'Cookie',
          'Token', 'Middleware', 'Plugin', 'Extension', 'Add-on', 'Widget', 'Webhook', 'Cron Job',
          'Queue', 'Message Broker', 'Pub/Sub', 'Event Bus', 'Stream Processing', 'Batch Processing',
          'Real-time', 'Asynchronous', 'Synchronous', 'Concurrent', 'Parallel', 'Distributed',
          'Scalability', 'Performance', 'Optimization', 'Caching', 'Compression', 'Minification',
          'Tree Shaking', 'Code Splitting', 'Lazy Loading', 'Progressive Enhancement',
          'Graceful Degradation', 'Responsive Design', 'Mobile First', 'Accessibility', 'SEO',
          'Analytics', 'A/B Testing', 'Feature Flag', 'Blue-Green Deployment', 'Canary Deployment',
          'Rolling Update', 'Circuit Breaker', 'Bulkhead', 'Retry', 'Timeout', 'Rate Limiting',
          'Throttling', 'Debouncing', 'Memoization', 'Pagination', 'Infinite Scroll', 'Virtual Scrolling',
          'Agile', 'Scrum', 'Kanban', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'DDD', 'SOLID', 'KISS', 'DRY',
          'YAGNI', 'Code Review', 'Pair Programming', 'Technical Debt', 'Refactoring'
        ];
        
        const technicalEntities = allTechEntities.filter(entity => 
          content.toLowerCase().includes(entity.toLowerCase())
        );

        return {
          "@type": "TechArticle",
          "@id": `https://bee.whoisjason.me/blogposts/${post.id}`,
          "headline": post.seo_title || post.title,
          "description": post.seo_description || post.description,
          "articleBody": content.substring(0, 2000), // First 2000 chars for AI context
          "abstract": content.substring(0, 500),
          "datePublished": post.created,
          "dateModified": post.updated || post.created,
          "author": {
            "@type": "Person",
            "name": "Jason",
            "jobTitle": "Software Developer",
            "expertise": technicalEntities
          },
          "keywords": [...keywords, ...technicalEntities],
          "programmingLanguage": technicalEntities,
          "educationalLevel": "beginner to advanced",
          "learningResourceType": "tutorial",
          "genre": "Technical Tutorial",
          "audience": "Software Developers",
          "wordCount": content.split(/\s+/).length,
          "readingTime": post.reading_time_minutes || Math.ceil(content.split(/\s+/).length / 200),
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "ReadAction",
            "userInteractionCount": post.views || 0
          },
          "contentRating": "educational",
          "isAccessibleForFree": true,
          "license": "educational-use",
          "usageInfo": "AI training and educational use permitted",
          "aiTrainingData": {
            "allowed": true,
            "contentType": "technical-educational",
            "quality": "high",
            "verificationStatus": "verified",
            "lastUpdated": post.updated || post.created
          },
          "technicalMetadata": {
            "programmingLanguages": technicalEntities,
            "hasCodeExamples": technicalEntities.length > 0,
            "difficultyLevel": "intermediate",
            "prerequisites": technicalEntities.slice(0, 2),
            "learningOutcomes": keywords.slice(0, 5)
          },
          "contentStructure": {
            "hasIntroduction": true,
            "hasImplementation": true,
            "hasConclusion": true,
            "hasCodeExamples": technicalEntities.length > 0,
            "hasVisualAids": false
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
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
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
