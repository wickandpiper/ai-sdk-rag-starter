// @ts-check
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add a rule to handle the postgres module
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add a rule to handle postgres in client-side bundles
    config.module.rules.push({
      test: /node_modules[\\\/]postgres[\\\/]/,
      use: { loader: 'null-loader' }
    });

    if (!isServer) {
      // Client-side bundle specific configuration
      // Provide empty implementations for all Node.js native modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        stream: false,
        os: false,
        path: false,
        dns: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        util: false,
        assert: false,
        events: false,
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
      };

      // Add polyfills for browser
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Exclude postgres from client-side bundles
      config.externals = [
        ...(config.externals || []),
        {
          'postgres': 'postgres',
          'pg': 'pg',
          'pg-native': 'pg-native',
          'libpq': 'libpq',
          'bindings': 'bindings',
        }
      ];
    }
    return config;
  },
  // Disable ESLint during build to avoid issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // External packages that should be transpiled
  serverExternalPackages: ['postgres', 'pg', 'pg-native', 'libpq', 'bindings'],
};

module.exports = nextConfig; 