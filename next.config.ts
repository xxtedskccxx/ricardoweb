import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinary/loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  typedRoutes: true,
  // One canonical address: send www and the old vercel.app URL to the domain.
  async redirects() {
    return ["www.rickydeventa.com", "ricardoweb-two.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://rickydeventa.com/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
