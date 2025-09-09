/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Explicitly set the workspace root to avoid multiple lockfile warnings
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
