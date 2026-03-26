const CACHE_NAME = "ballsort-v2"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.jpg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn("[SW] Pre-cache failed:", err))
  )
  // Activate immediately — don't wait for old SW to finish
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  // ── Only cache GET requests ─────────────────────────────
  // Cache API does NOT support PUT / POST / DELETE etc.
  if (request.method !== "GET") return

  // ── Skip non-http(s) requests (chrome-extension etc.) ───
  if (!request.url.startsWith("http")) return

  // ── Skip Supabase / API calls — always fetch live ───────
  const url = new URL(request.url)
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/v1/")
  ) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((networkResponse) => {
          // Only cache valid same-origin or opaque responses for static assets
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            (networkResponse.type !== "basic" && networkResponse.type !== "opaque")
          ) {
            return networkResponse
          }

          // Don't cache if response has cache-control: no-store
          const cacheControl = networkResponse.headers.get("cache-control") || ""
          if (cacheControl.includes("no-store")) {
            return networkResponse
          }

          const responseToCache = networkResponse.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch((err) => console.warn("[SW] Cache put failed:", err))

          return networkResponse
        })
        .catch(() => {
          // Offline fallback: return cached "/" for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/")
          }
        })
    })
  )
})
