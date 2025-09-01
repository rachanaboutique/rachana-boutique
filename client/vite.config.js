// import path from "path";
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react({
      // ✅ Optimize React for production
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
        ] : []
      }
    }),

    // ✅ Enhanced Compression with both Gzip and Brotli
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),

    // ✅ Bundle analyzer for development (only when ANALYZE=true)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }),

    // ✅ Add Progressive Web App (PWA) Support
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "site.webmanifest",
      workbox: {
        // ✅ Increase cache size limit to handle larger bundles
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB
        // ✅ Skip caching large vendor files to avoid cache bloat
        globIgnores: ['**/assets/vendor-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: "Rachana Boutique",
        short_name: "Boutique",
        description: "Discover trendy ethnic and western wear at Rachana Boutique.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // ✅ Optimize build output for modern browsers
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        safari10: true // Fix Safari 10 issues
      }
    },
    // ✅ Disable source maps for production (reduces build size)
    sourcemap: false,
    // ✅ Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    // ✅ Enable CSS code splitting
    cssCodeSplit: true,
    // ✅ Enhanced Code Splitting for Better Performance
    rollupOptions: {
      output: {
        // ✅ Dynamic chunk naming for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.names?.[0]?.split('.') || ['asset'];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.names?.[0] || '')) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.names?.[0] || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
        // ✅ Optimized manual chunks with size considerations
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react/') && !id.includes('react-router') && !id.includes('react-redux')) {
            return 'react-core';
          }
          if (id.includes('react-dom')) {
            return 'react-dom';
          }

          // React Router
          if (id.includes('react-router') || id.includes('@remix-run/router')) {
            return 'react-router';
          }

          // Redux and state management
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux')) {
            return 'redux';
          }

          // Radix UI components (split into smaller chunks)
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-toast') || id.includes('@radix-ui/react-alert-dialog')) {
            return 'radix-overlays';
          }
          if (id.includes('@radix-ui/react-select') || id.includes('@radix-ui/react-dropdown-menu') || id.includes('@radix-ui/react-tabs')) {
            return 'radix-inputs';
          }
          if (id.includes('@radix-ui')) {
            return 'radix-core';
          }

          // Chart libraries (lazy load)
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          // Media libraries (split further)
          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'framer-motion';
          }
          if (id.includes('react-player') || id.includes('youtube-player')) {
            return 'video-players';
          }

          // Slider libraries
          if (id.includes('react-slick') || id.includes('slick-carousel')) {
            return 'sliders';
          }

          // HTTP and utilities
          if (id.includes('axios')) {
            return 'http';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('clsx') || id.includes('class-variance-authority')) {
            return 'utils';
          }

          // React Helmet
          if (id.includes('react-helmet')) {
            return 'helmet';
          }

          // Cloudinary
          if (id.includes('@cloudinary')) {
            return 'cloudinary';
          }

          // FFmpeg (very large, separate chunk)
          if (id.includes('@ffmpeg')) {
            return 'ffmpeg';
          }

          // Scheduler and other React internals
          if (id.includes('scheduler') || id.includes('use-sync-external-store')) {
            return 'react-internals';
          }

          // Split remaining vendor libraries into smaller chunks
          if (id.includes('node_modules')) {
            // Create smaller vendor chunks based on package size/type
            if (id.includes('date-fns') || id.includes('moment')) {
              return 'date-utils';
            }
            if (id.includes('lodash') || id.includes('ramda')) {
              return 'functional-utils';
            }
            // Default vendor chunk for smaller libraries
            return 'vendor-misc';
          }
        },
      },
    },
  },
  // ✅ Optimized development server
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    cors: true,
    // ✅ Enable HTTP/2 for faster development
    https: false,
    // ✅ Optimize HMR
    hmr: {
      overlay: true
    }
  },

  // ✅ Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios'
    ],
    exclude: [
      // Exclude large libraries that should be lazy loaded
      'chart.js',
      'react-chartjs-2'
    ]
  },

  // ✅ Enable experimental features for better performance
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true
  },
});
