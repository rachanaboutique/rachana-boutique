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

export default defineConfig({
  plugins: [
    react(),

    // ✅ Enable Gzip Compression for Faster Load Times
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
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
    // ✅ Optimize build output - Changed to es2020 for better iOS Safari compatibility
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // ✅ Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // ✅ Enhanced Code Splitting for Better Performance
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Split React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // ✅ Split Redux and state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // ✅ Split UI libraries (Radix UI components)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-label',
            '@radix-ui/react-slot'
          ],
          // ✅ Split utility libraries
          'utils-vendor': ['axios', 'country-state-city', 'lucide-react', 'clsx', 'class-variance-authority'],
          // ✅ Split chart libraries
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          // ✅ Split media libraries
          'media-vendor': ['react-player', 'react-slick', 'slick-carousel', 'framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    strictPort: true,
    cors: true,
  },
});
