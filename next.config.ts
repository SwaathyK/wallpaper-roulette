import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Use this package as root so compilation doesn’t hang on parent lockfiles
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
