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
          // Split BabylonJS into separate chunk
          babylon: ["@babylonjs/core"],
          // Split Rapier into separate chunk
          rapier: ["@dimforge/rapier3d-compat"],
        },
      },
    },
    // Adjust chunk size warning limit
    chunkSizeWarningLimit: 1000,
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
