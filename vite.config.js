import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function rejectLegacyPreviewEntry() {
  return {
    name: "reject-legacy-preview-entry",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/ui-preview.html")) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Use /index.html instead.");
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/ui-preview.html")) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Use /index.html instead.");
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [rejectLegacyPreviewEntry(), vue()]
});
