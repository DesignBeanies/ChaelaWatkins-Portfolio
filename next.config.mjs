/** @type {import('next').NextConfig} */
const basePath = "/ChaelaWatkins-Portfolio";

/**
 * In dev only: visiting http://localhost:3000/ (no basePath) otherwise serves HTML
 * whose asset URLs omit basePath → 404 on /_next/static/*. Redirect root to the app.
 * Omitted in production builds — `output: 'export'` does not support redirects.
 */
const devOnly =
  process.env.NODE_ENV === "development"
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
    : {};

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
  ...devOnly,
};

export default nextConfig;
