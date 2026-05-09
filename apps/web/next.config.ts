import type { Config } from 'next';

const config: Config = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@monopol/ui',
    '@monopol/editor',
    '@monopol/timeline',
    '@monopol/types',
    '@monopol/shared',
  ],
  experimental: {
    optimizePackageImports: [
      '@monopol/ui',
      'lucide-react',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};

export default config;
