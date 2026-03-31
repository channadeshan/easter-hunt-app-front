import React from "react";
import ReactDOM from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import App from "./App.tsx";
import "./index.css";

// Top-level SW registration hook wrapper
function Root() {
  // autoUpdate mode: the SW updates silently in the background.
  // The `updateServiceWorker` call below re-loads the page once a new
  // version is waiting — users always get fresh code without any prompt.
  useRegisterSW({
    onRegistered(r) {
      // Poll for updates every 60 seconds (useful for long hunt sessions)
      if (r) {
        setInterval(() => r.update(), 60_000);
      }
    },
    onRegisterError(error) {
      console.warn("[PWA] SW registration failed:", error);
    },
  });

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
