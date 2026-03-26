"use client"

// ============================================================
// app/admin/ads/page.tsx
// Admin page — protect this with a password in production!
// ============================================================

import { useState } from "react"
import { AdAnalyticsDashboard } from "@/components/ads/AdAnalyticsDashboard"
import { Lock } from "lucide-react"

// Simple password protection — replace with real auth in production
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ballsort2025"

export default function AdminAdsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      setError(true)
      setPassword("")
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Admin Access</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Ad Analytics Dashboard
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Enter admin password"
              className={`w-full bg-secondary border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                error ? "border-red-500" : "border-border focus:border-primary"
              }`}
            />
            {error && (
              <p className="text-red-500 text-xs">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdAnalyticsDashboard />
}
