import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mediumrare.imgix.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
