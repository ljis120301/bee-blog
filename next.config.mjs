/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.whoisjason.me'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'api.whoisjason.me',
        'whoisjason.me',
        'localhost:3000',
        '192.168.1.173:3000',
        'bee.whoisjason.me',
        'localhost:8081',
        '192.168.1.173:8081',
        '10.0.0.5:3000',
        '10.0.0.5:8081',
        '10.0.0.5'
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NODE_ENV === 'development' 
              ? 'http://10.0.0.5:3000' 
              : 'https://api.whoisjason.me'
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, PUT, DELETE, OPTIONS' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token' 
          },
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          {
            key: 'Content-Security-Policy',
            value: "object-src 'self' blob: data: filesystem: *;"
          }
        ],
      },
      {
        // Additional headers for API routes
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Max-Age', 
            value: '86400' 
          }
        ],
      }
    ];
  },
};

export default nextConfig;
