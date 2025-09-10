import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["sep.turbifycdn.com"], // Allow external images from turbify
  },
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
  experimental: {
    externalDir: true, // <-- allow importing modules from outside the project root
  },
};

export default nextConfig;
