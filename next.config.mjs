/** @type {import('next').NextConfig} */
const basePath = "/ChaelaWatkins-Portfolio";

/**
 * Only `next build` sets NODE_ENV=production reliably. Using `=== "development"`
 * breaks when NODE_ENV is unset — Next would still enable `output: "export"` in
 * dev and Tailwind/CSS chunks fail to load (unstyled page).
 */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Static export only for production builds (GitHub Pages).
 * Non-production: no export so dev server loads CSS correctly; root redirect works.
 */
const nextConfig = {
  ...(isProduction ? { output: "export" } : {}),
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(!isProduction
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
