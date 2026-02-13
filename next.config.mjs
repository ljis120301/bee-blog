/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next.js 16 experimental features for maximum performance
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
    // Note: cacheComponents (PPR) disabled for now - incompatible with existing route segment configs
    // Can be enabled after migrating all dynamic/revalidate route configs
  },

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Compress responses
  compress: true,

  // Security headers for better SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Redirect configuration for SEO
  async redirects() {
    return [
      // Add any necessary redirects here
      // Example: redirect old URLs to new ones
    ];
  },

  // Proxy Rybbit analytics through own domain to avoid cross-site cookie issues
  async rewrites() {
    return [
      {
        source: '/rb/script.js',
        destination: 'https://tracking.whoisjason.me/api/script.js',
      },
      {
        source: '/rb/track',
        destination: 'https://tracking.whoisjason.me/api/track',
      },
    ];
  },

  // Opt into Turbopack explicitly; remove webpack overrides to match Next 16 defaults
  turbopack: {},
};

export default nextConfig;