
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element "#root" not found');
}

try {
  createRoot(rootEl).render(<App />);
} catch (e) {
  // Last-resort fallback so deployments never show a blank white screen.
  // This is only shown if React fails to initialize at runtime.
  const msg = e instanceof Error ? e.message : String(e);
  rootEl.innerHTML = `
    <div style="font-family: ui-sans-serif, system-ui; padding: 24px; max-width: 720px; margin: 0 auto;">
      <h1 style="font-size: 18px; font-weight: 700; margin: 0 0 8px;">App failed to start</h1>
      <p style="margin: 0 0 12px; color: #444;">This usually happens due to a cached/incorrect JS bundle on the hosting platform.</p>
      <pre style="background: #f6f6f6; padding: 12px; border-radius: 8px; overflow:auto;">${msg}</pre>
      <p style="margin: 12px 0 0; color: #444;">Try: hard refresh, clear site data, or redeploy.</p>
    </div>
  `;
}
  