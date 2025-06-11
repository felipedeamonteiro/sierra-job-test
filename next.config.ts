import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable Turbopack to use Webpack consistently
  experimental: {
    turbo: undefined,
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.js': 'pdfjs-dist/build/pdf.worker.min.js',
    };
    
    // Exclude mammoth from server-side builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('mammoth');
      config.externals.push('mammoth/mammoth.browser');
    } else {
      // For client-side builds, configure mammoth properly
      config.resolve.alias = {
        ...config.resolve.alias,
        'mammoth': 'mammoth/mammoth.browser',
      };
      
      // Add webpack plugin to ignore dynamic requires in mammoth
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /mammoth/,
        })
      );
      
      // Configure webpack to handle mammoth's dynamic requires
      config.module.rules.push({
        test: /mammoth\.browser\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-modules-commonjs', { loose: true }],
              '@babel/plugin-transform-dynamic-import'
            ]
          }
        }
      });
    }
    
    return config;
  },
  
  // Allow external resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
