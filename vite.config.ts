import { defineConfig } from "vite";

export default defineConfig({
  // Base URL for deployment (change if deploying to subdirectory)
  base: "/plinko/",

  // Build optimization
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
    },
    assetsDir: "assets", // 所有 js/css/圖片/wasm 會放在 /plinko/assets/...
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep BabylonJS as one chunk to avoid circular dependency issues
          babylon: ["@babylonjs/core"],
          // Keep Rapier as separate chunk
          rapier: ["@dimforge/rapier3d-compat"],
        },
      },
    },
    // Increase warning limit since BabylonJS/Rapier are inherently large
    // babylon: ~5.1MB, rapier: ~2MB (these are optimized 3D/physics engines)
    chunkSizeWarningLimit: 6000,
  },

  // Development server
  server: {
    port: 5173,
    open: true,
    host: true, // Enable access from network devices
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
    open: true,
  },
});
