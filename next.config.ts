import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  // Your Next.js config here
  output: 'standalone', // Required for OpenNext/Cloudflare Workers deployment
  outputFileTracingRoot: process.cwd(), // Fix for OpenNext Cloudflare standalone path issue
  serverExternalPackages: ['@silvia-odwyer/photon'],
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
