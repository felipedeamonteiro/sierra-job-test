import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  webpack: (config, { isServer, dev }) => {
    // Basic fallbacks for Node.js modules
    config.resolve.fallback = { 
      fs: false, 
      path: false,
      crypto: false,
      stream: false,
      buffer: false
    };
    
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
      // For client-side builds, use mammoth browser version
      config.resolve.alias = {
        ...config.resolve.alias,
        'mammoth': 'mammoth/mammoth.browser',
      };
    }
    
    // Disable minification entirely to prevent webpack errors with mammoth.js
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    
    // Handle mammoth's dynamic requires by ignoring them
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add a rule to handle mammoth's problematic requires
    config.module.rules.push({
      test: /mammoth\.browser\.js$/,
      parser: {
        amd: false,
        commonjs: false,
        system: false,
        harmony: false,
        requireInclude: false,
        requireEnsure: false,
        requireContext: false,
        browserify: false,
        requireJs: false,
        node: false
      }
    });
    
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
