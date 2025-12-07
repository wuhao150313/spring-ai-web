import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // 代理所有 /api 和 /ai 开头的请求到后端（8081端口，带/api-template前缀）
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api-template${path}`,
        ws: true,
      },
      "/ai": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api-template${path}`,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
      // 校园智能助手API代理（8082端口，无前缀）
      "/api/v1": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/api/v2": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
