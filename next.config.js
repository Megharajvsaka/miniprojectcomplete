/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // Fix for MongoDB native modules in Next.js 15
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize MongoDB native modules on the server
      config.externals.push({
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'aws4': 'commonjs aws4',
        'snappy': 'commonjs snappy',
        'kerberos': 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        'gcp-metadata': 'commonjs gcp-metadata',
        'socks': 'commonjs socks'
      });
    }

    // Ignore node built-in modules in client-side bundles
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
      child_process: false,
      'mongodb-client-encryption': false,
      // Add these new ones for MongoDB OIDC auth
      'timers/promises': false,
      timers: false,
      stream: false,
      util: false,
      url: false,
      http: false,
      https: false,
      crypto: false,
      os: false,
      path: false,
      zlib: false,
    };

    return config;
  },
};

module.exports = nextConfig;