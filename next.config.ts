import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ssh2", "node-nmap"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
