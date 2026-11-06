import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages ? "/pas-a-pas" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  allowedDevOrigins: ["10.24.56.64"],
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

export default nextConfig;
