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
        manualChunks: (id) => {
          // BabylonJS core
          if (id.includes("@babylonjs/core")) {
            // Split BabylonJS into smaller chunks
            if (id.includes("Cameras")) return "babylon-cameras";
            if (id.includes("Materials")) return "babylon-materials";
            if (id.includes("Meshes")) return "babylon-meshes";
            if (id.includes("Lights")) return "babylon-lights";
            return "babylon-core";
          }
          // Rapier physics
          if (id.includes("@dimforge/rapier")) {
            return "rapier";
          }
          // Vendor chunks (other node_modules)
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    // Increase warning limit since BabylonJS/Rapier are inherently large
    // babylon-core: ~3.4MB, rapier: ~2MB (these are optimized 3D/physics engines)
    chunkSizeWarningLimit: 3500,
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
