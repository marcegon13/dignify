import type { NextConfig } from "next";

const isMobile = process.env.IS_MOBILE === 'true';

const nextConfig: NextConfig = {
  output: isMobile ? 'export' : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
