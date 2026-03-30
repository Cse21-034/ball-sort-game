const CACHE_NAME = "ballsort-v3"

// Only cache specific static assets that don't change between deploys
const urlsToCache = [
  "/manifest.json",
  "/icons/icon-192x192.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn("[SW] Pre-cache failed:", err))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL old caches (including v2)
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
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

  if (request.method !== "GET") return
  if (!request.url.startsWith("http")) return

  const url = new URL(request.url)

  // NEVER cache Next.js build chunks — they have content hashes and
  // 404 when a new deploy happens with old cached hashes
  if (url.pathname.startsWith("/_next/")) return

  // Never cache Supabase / API calls
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/v1/")
  ) {
    return
  }

  // For navigation requests, use network-first so new deploys work
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the page for offline fallback
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match("/") || caches.match(request))
    )
    return
  }

  // For other static assets (icons, manifest), use cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
