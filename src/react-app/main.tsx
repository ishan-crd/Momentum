import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "@/react-app/index.css";
import App from "@/react-app/App";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl || convexUrl === "undefined") {
  const root = document.getElementById("root")!;
  root.innerHTML = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 2rem auto; padding: 1.5rem; text-align: center;">
      <h1 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Momentum</h1>
      <p style="color: #64748b; margin-bottom: 1rem;">This app needs a Convex backend URL to run.</p>
      <p style="font-size: 0.875rem; color: #94a3b8;">Set <strong>VITE_CONVEX_URL</strong> in your deployment environment (e.g. Vercel → Project → Settings → Environment Variables) to your Convex deployment URL, then redeploy.</p>
    </div>
  `;
} else {
  const convex = new ConvexReactClient(convexUrl);
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ConvexAuthProvider client={convex}>
        <App />
        <Toaster position="bottom-center" richColors />
      </ConvexAuthProvider>
    </StrictMode>
  );
}
