import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { AuthProvider } from "@/lib/auth/AuthContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ball Sort Puzzle - Relaxing Color Sorting Game",
  description:
    "Sort colorful balls into tubes in this addictive puzzle game. Train your brain with 500+ levels from beginner to expert. Free to play!",
  keywords: ["ball sort", "puzzle game", "color sort", "brain training", "casual game"],
  generator: "v0.app",
  manifest: "/manifest.json",
  // Google AdSense verification
  verification: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? {
    google: "5482317329371849", // Your AdSense Publisher ID
  } : undefined,
  other: {
    "google-adsense-account": "ca-pub-5482317329371849", // Full AdSense account ID
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ball Sort",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script — only loads if env var is set */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        {/* PayPal SDK Script — for premium payment processing */}
        {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
          <script
            src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
            async
          />
        )}
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
