import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["sep.turbifycdn.com"], // Allow external images from turbify
  },
};

export default nextConfig;
