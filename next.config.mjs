/** @type {import('next').NextConfig} */
const basePath = "/ChaelaWatkins-Portfolio";

/**
 * Enable static export only when `next build` runs — not from NODE_ENV alone.
 * A stray `NODE_ENV=production` (shell, CI, dotenv) during `next dev` would
 * otherwise turn on `output: "export"` and Tailwind/CSS chunks fail to load.
 */
const isRunningNextBuild = process.argv.includes("build");

/**
 * Static export for production `next build` (GitHub Pages).
 * Dev omits export so CSS loads; root redirect only when not building.
 */
const nextConfig = {
  ...(isRunningNextBuild ? { output: "export" } : {}),
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(!isRunningNextBuild
    ? {
        async redirects() {
          return [
            {
              source: "/",
              destination: `${basePath}/`,
              basePath: false,
              permanent: false,
            },
          ];
        },
      }
    : {}),
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  poweredByHeader: false,
};

export default nextConfig;
