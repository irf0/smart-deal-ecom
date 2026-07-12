import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wauwfmmozhanbltvyyow.supabase.co",
      },
    ],
  },
};

export default nextConfig;
