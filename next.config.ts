import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev resources (HMR) to be requested from this host/IP during development
  allowedDevOrigins: ['10.5.0.2'],
  // Configure external image hosts for next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
