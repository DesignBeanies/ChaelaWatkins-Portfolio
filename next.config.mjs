/** @type {import('next').NextConfig} */
const basePath = "/ChaelaWatkins-Portfolio";

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Smaller client bundles for barrel-heavy packages (no UI change).
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  poweredByHeader: false,
};

export default nextConfig;
