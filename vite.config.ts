import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig({
	  plugins: [
	    ...mochaPlugins(process.env as Record<string, string | undefined>),
	    react(),
	    cloudflare({
	      // auxiliaryWorkers only on Mocha; omit for local dev so Vite can start
	      ...(process.env.CF_EMAILS_SERVICE_PATH && {
	        auxiliaryWorkers: [{ configPath: process.env.CF_EMAILS_SERVICE_PATH }],
	      }),
	    }),
	  ],
	  server: {
	    allowedHosts: true,
	  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "convex/_generated": path.resolve(__dirname, "./convex/_generated"),
    },
  },
});
