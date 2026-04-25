/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller client bundles for barrel-heavy packages (no UI change).
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  // Minor hardening; no change to page output.
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/espresso",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
