import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained server output for the Docker image (.next/standalone).
  // Vercel uses its own build pipeline and ignores this — safe for both targets.
  output: "standalone",
};

export default nextConfig;
