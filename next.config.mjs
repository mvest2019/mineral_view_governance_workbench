/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module; keep it external to the server bundle so
  // Next.js does not try to bundle its .node binary.
  serverExternalPackages: ['better-sqlite3'],
  eslint: {
    // Lint is run explicitly via `npm run lint`; do not fail production builds on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
