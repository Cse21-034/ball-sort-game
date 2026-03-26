"use client"

// ============================================================
// components/ads/AdAnalyticsDashboard.tsx  (updated)
// Now reads from Supabase — shows ALL users' real data
// ============================================================

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3, Eye, MousePointer, TrendingUp,
  Play, SkipForward, Link, RefreshCw, Download, Users,
} from "lucide-react"
import {
  getAdAnalyticsFromDB,
  getAffiliateAnalyticsFromDB,
  type AdAnalytics,
} from "@/lib/ad-tracker-db"

export function AdAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null)
  const [affiliateData, setAffiliateData] = useState<Record<string, number>>({})
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const refresh = async () => {
    setRefreshing(true)
    const [adData, affData] = await Promise.all([
      getAdAnalyticsFromDB(),
      getAffiliateAnalyticsFromDB(),
    ])
    setAnalytics(adData)
    setAffiliateData(affData)
    setLastRefresh(new Date())
    setRefreshing(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const exportCSV = () => {
    if (!analytics) return
    const rows = [
      ["Advertiser", "Views", "Completions", "Skips", "Clicks", "Completion %", "CTR %"],
      ...Object.values(analytics.byAdvertiser).map((s) => [
        s.advertiserName,
        s.views,
        s.completions,
        s.skips,
        s.clicks,
        `${s.completionRate}%`,
        `${s.clickThroughRate}%`,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ad-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading analytics from database…
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Total Views", value: analytics.totalViews, icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Completions", value: analytics.totalCompletions, icon: Play, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Skips", value: analytics.totalSkips, icon: SkipForward, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Clicks", value: analytics.totalClicks, icon: MousePointer, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Completion Rate", value: `${analytics.completionRate}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Click-Through Rate", value: `${analytics.clickThroughRate}%`, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Unique Users", value: analytics.uniqueUsers, icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-accent" />
              Ad Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live data from Supabase · Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {card.label}
                </span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-advertiser breakdown */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-lg">By Advertiser</h2>
            <p className="text-sm text-muted-foreground">
              Aggregated across all {analytics.uniqueUsers} users
            </p>
          </div>

          {Object.keys(analytics.byAdvertiser).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No ad events recorded yet</p>
              <p className="text-sm mt-1">Data appears once users start watching ads</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Object.values(analytics.byAdvertiser).map((stats) => (
                <div key={stats.advertiserName} className="p-5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{stats.advertiserName}</h3>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{stats.views} views</span>
                      <span>{stats.completions} completions</span>
                      <span>{stats.clicks} clicks</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completion rate</span>
                      <span className="font-medium text-green-400">{stats.completionRate}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${stats.completionRate}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Click-through rate</span>
                      <span className="font-medium text-purple-400">{stats.clickThroughRate}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${stats.clickThroughRate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Affiliate clicks */}
        {Object.keys(affiliateData).length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Link className="h-5 w-5 text-accent" />
                Affiliate Link Clicks
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(affiliateData)
                .sort(([, a], [, b]) => b - a)
                .map(([name, clicks]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="font-medium">{name}</span>
                    <span className="bg-accent/20 text-accent text-sm font-bold px-3 py-1 rounded-full">
                      {clicks} clicks
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Billing helper */}
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5">
          <h3 className="font-semibold text-yellow-400 mb-2">💡 Billing your advertisers</h3>
          <p className="text-sm text-muted-foreground">Use these stats to invoice your clients. Common models:</p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li><strong>CPM:</strong> Charge per 1,000 views (completions)</li>
            <li><strong>CPC:</strong> Charge per click on their ad</li>
            <li><strong>Flat rate:</strong> Fixed monthly/weekly fee</li>
          </ul>
          <button onClick={exportCSV} className="mt-3 text-sm text-yellow-400 font-medium hover:underline flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download report for client
          </button>
        </div>
      </div>
    </div>
  )
}
