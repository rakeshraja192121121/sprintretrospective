import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["sep.turbifycdn.com"], // Allow external images from turbify
  },
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
};

export default nextConfig;
