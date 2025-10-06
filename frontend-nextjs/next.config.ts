import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Disable ESLint during builds to test .env.production
    ignoreDuringBuilds: true,
  },
  /* config options here */
};

export default nextConfig;
