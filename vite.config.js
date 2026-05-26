import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    // Enable CSS minification via esbuild (bundled with Vite)
    cssMinify: 'esbuild',

    // Increase chunk warning threshold (images inflate it)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunking for optimal caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
        // Hash-based filenames for long-term caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize output by asset type
          if (/\.(png|jpe?g|webp|gif|svg|ico)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },

    // Enable source maps for debugging
    sourcemap: false,
  },

  // Optimise dev server
  server: {
    hmr: { overlay: true },
  },
})
