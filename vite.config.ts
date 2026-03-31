import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate' silently updates the SW in the background,
      // then the new version activates on the next page load.
      registerType: "autoUpdate",

      // Include all static assets in precache
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icons/*.png",
        "screenshot-*.png",
      ],

      // ---- Web App Manifest ----
      manifest: {
        name: "Campus Easter Egg Hunt",
        short_name: "Egg Hunt",
        description:
          "Live multiplayer Easter Egg Hunt for your campus. Find eggs, scan QR codes, and compete in real time.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: [
          "window-controls-overlay",
          "standalone",
          "minimal-ui",
        ],
        orientation: "portrait-primary",
        background_color: "#0d0f1a",
        theme_color: "#0d0f1a",
        categories: ["games", "entertainment"],
        lang: "en-US",

        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          // Maskable variants (Android adaptive icons)
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],

        screenshots: [
          {
            src: "/screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "Admin dashboard showing live player stats",
          },
          {
            src: "/screenshot-mobile.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Participant egg hitlist on mobile",
          },
        ],

        shortcuts: [
          {
            name: "Scan a QR Code",
            short_name: "Scan",
            description: "Open the QR scanner directly",
            url: "/play/scan",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
          },
          {
            name: "My Egg Hitlist",
            short_name: "Hitlist",
            description: "See all available eggs",
            url: "/play",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
          },
        ],
      },

      // ---- Workbox Service Worker ----
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],

        runtimeCaching: [
          // Google Fonts — CacheFirst, very long TTL
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Backend API — NetworkFirst so live data stays fresh,
          // falls back to cached response if player loses signal mid-hunt
          {
            urlPattern: ({ url }) =>
              !!url.pathname.match(/^\/(eggs|hints|activities|status)/),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],

        skipWaiting: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false, // flip to true to test SW during `npm run dev`
        type: "module",
      },
    }),
  ],

  server: {
    port: 5173,

    // ─── Dev Proxy ────────────────────────────────────────────────────────────
    // Routes all backend traffic through Vite so everything is same-origin.
    // Eliminates CORS issues in dev WITHOUT touching the backend.
    //
    // HOW IT WORKS:
    //   Browser → http://localhost:5173/socket.io/...
    //   Vite    → http://localhost:5050/socket.io/...  (forwarded transparently)
    //   Response comes back via Vite → browser sees same origin → no CORS block
    //
    // NOTE: This only works in `npm run dev`. In production, configure nginx/
    //       caddy to proxy the same paths, OR fix the backend CORS config.
    // ─────────────────────────────────────────────────────────────────────────
    proxy: {
      // Socket.IO — ws:true is critical to upgrade HTTP→WebSocket
      "/socket.io": {
        target: "http://localhost:5050",
        changeOrigin: true,
        ws: true,
      },
      // Admin API
      "/api/admin": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      // Participant API
      "/api/parti": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      // Auth API (The new one you needed!)
      "/api/auth": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
});
