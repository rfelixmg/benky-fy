import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000'
      : process.env.NEXT_PUBLIC_API_URL
  },
  // Ensure we handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '${process.env.NEXT_PUBLIC_API_URL}/api/:path*'
      }
    ]
  },
  // Configure image optimization
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/static/img/**',
      },
    ],
  }
};

export default nextConfig;
