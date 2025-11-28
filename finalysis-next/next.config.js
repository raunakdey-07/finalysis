/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Explicitly set the workspace root to avoid multiple lockfile warnings
  outputFileTracingRoot: __dirname,
}

module.exports = withBundleAnalyzer(nextConfig)
