/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module; keep it external to the server bundle so
  // Next.js does not try to bundle its .node binary.
  serverExternalPackages: ['better-sqlite3'],
  // Ensure the native binary is traced into the serverless function bundles on
  // Vercel (otherwise the API routes fail to load better-sqlite3 at runtime).
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/better-sqlite3/build/Release/*.node'],
  },
  eslint: {
    // Lint is run explicitly via `npm run lint`; do not fail production builds on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
