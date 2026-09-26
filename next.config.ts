import type { NextConfig } from "next";

// Proxy da API Java: src/app/api/[...path]/route.ts
// Auth de rotas: src/middleware.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
