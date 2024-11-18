import NextBundleAnalyzer from '@next/bundle-analyzer'
import { config } from 'dotenv'

process.title = 'Hero (NextJS)'

const env = config().parsed || {}
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-mutable-exports
let nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  output: 'standalone',
  assetPrefix: isProd ? env.ASSETPREFIX || undefined : undefined,
  compiler: {
    // reactRemoveProperties: { properties: ['^data-id$', '^data-(\\w+)-id$'] },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/atom.xml', destination: '/feed' },
        { source: '/sitemap.xml', destination: '/sitemap' },
      ],
    }
  },

  webpack: (config, options) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    })

    return config
  },
}

if (process.env.ANALYZE === 'true') {
  nextConfig = NextBundleAnalyzer({
    enabled: true,
  })(nextConfig)
}

export default nextConfig
