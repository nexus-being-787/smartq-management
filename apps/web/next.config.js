/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@smartq/types', '@smartq/queue-logic', '@smartq/api-client', '@smartq/ui-tokens'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
