/** @type {import('next').NextConfig} */
/** GitHub Pages project URL — kept for `next build` / static export (see verify-styling). */
const prodBasePath = "/ChaelaWatkins-Portfolio";
/** In `next dev` only: serve at `http://localhost:3000/` so `_next` chunks load without the path segment. */
const basePath = process.argv.includes("dev") ? "" : prodBasePath;

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
  // Root → base path only when the app is deployed under prodBasePath (skip in `next dev`, where basePath is "").
  ...(basePath && !isRunningNextBuild
    ? {
        async redirects() {
          return [
            {
              source: "/",
              destination: `${prodBasePath}/`,
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
