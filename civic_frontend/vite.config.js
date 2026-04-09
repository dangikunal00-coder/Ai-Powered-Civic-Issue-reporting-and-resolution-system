import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/predict": {
        target: "https://ai-powered-civic-issue-reporting-and.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
