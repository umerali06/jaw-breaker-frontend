import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174, // Set the default port to 5174
      strictPort: true, // Fail if port is already in use
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // Don't rewrite the path, keep it as is
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (_proxyReq, req, _res) => {
              console.log("Sending Request:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from:",
                req.url,
                proxyRes.statusCode
              );
            });
          },
        },
      },
      cors: true,
      hmr: {
        overlay: true,
      },
    },
    define: {
      // Make env variables available to the client code
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.VITE_API_BASE_URL": JSON.stringify(env.VITE_API_BASE_URL),
      "process.env.VITE_ENV": JSON.stringify(env.VITE_ENV),
      "process.env.VITE_USE_SAMPLE_DATA": JSON.stringify(
        env.VITE_USE_SAMPLE_DATA
      ),
      "process.env.VITE_USE_REAL_API": JSON.stringify(env.VITE_USE_REAL_API),
      "process.env.VITE_FRONTEND_URL": JSON.stringify(env.VITE_FRONTEND_URL),
    },
    optimizeDeps: {
      include: ["recharts"],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
    },
  };
});
