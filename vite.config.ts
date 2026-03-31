// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// export default defineConfig({
//   plugins: [
//     react(),
//     runtimeErrorOverlay(),
//     // Remove these Replit-specific plugins unless you are on Replit
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "client/src"),
//       "@shared": path.resolve(__dirname, "shared"),
//       "@assets": path.resolve(__dirname, "attached_assets"),
//     },
//   },
//   root: path.resolve(__dirname, "client"),
//   build: {
//     outDir: path.resolve(__dirname, "dist/public"),
//     emptyOutDir: true,
//   },
//   server: {
//     proxy: {
//       // All frontend requests to /api will be forwarded to your backend
//       "/api": {
//         target: "https://api.insydz.com", // your FastAPI/Express backend
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ""),
//       },
//     },
//     fs: {
//       strict: true,
//       deny: ["**/.*"],
//     },
//   },
// });

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import path from "path";

import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
 
export default defineConfig({

  plugins: [

    react(),

    runtimeErrorOverlay(),

  ],
 
  resolve: {

    alias: {

      "@": path.resolve(__dirname, "client/src"),

      "@shared": path.resolve(__dirname, "shared"),

      "@assets": path.resolve(__dirname, "attached_assets"),

    },

  },
 
  root: path.resolve(__dirname, "client"),
 
  build: {

    outDir: path.resolve(__dirname, "dist/public"),

    emptyOutDir: true,
    target: 'es2019',

  },
 
  server: {

    // ✅ Allow Cloudflare Tunnel domain

    allowedHosts: [

      "localhost",

      "127.0.0.1",

      "insydz.com",     // 👈 added your Cloudflare domain

    ],
 
    proxy: {

      "/api": {

        target: "https://api.insydz.com",

        changeOrigin: true,

        rewrite: (path) => path.replace(/^\/api/, ""),

      },

    },
 
    port: 5173,
 
    fs: {

      strict: true,

      deny: ["**/.*"],

    },

  },

});

 
