"use client"

// ============================================================
// components/screens/leaderboard-screen.tsx
//
// GLOBAL tab:
//   - One row per player, ranked by levels_completed (most = #1)
//   - Tiebreaker: higher total_score wins
//   - Shows: rank, name, levels completed, total score
//
// MY STATS tab:
//   - Your personal summary only (no per-level list)
//   - Shows: global rank, levels completed, total score,
//            total moves used, total time played, best level reached
// ============================================================

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Trophy, Medal, Crown, User,
  Loader2, Target, Hash, Clock, Zap, Star, BarChart3,
} from "lucide-react"
import {
  getGlobalLeaderboard,
  getMyStats,
  getPlayerId,
  cacheUserId,
  getPlayerName,
  setPlayerName,
  type GlobalPlayerEntry,
} from "@/lib/leaderboard"

interface LeaderboardScreenProps {
  onBack: () => void
}

type Tab = "global" | "personal"

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [tab, setTab] = useState<Tab>("global")
  const [globalEntries, setGlobalEntries] = useState<GlobalPlayerEntry[]>([])
  const [myStats, setMyStats] = useState<GlobalPlayerEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [playerNameInput, setPlayerNameInput] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [currentPlayerName, setCurrentPlayerName] = useState("Player")
  const [myId, setMyId] = useState("")

  useEffect(() => {
    cacheUserId().then(() => {
      const id = getPlayerId()
      setMyId(id)
      loadAll(id)
    })
    const name = getPlayerName()
    setCurrentPlayerName(name)
    setPlayerNameInput(name)
  }, [])

  const loadAll = async (playerId?: string) => {
    const id = playerId ?? getPlayerId()
    setLoading(true)
    const [global, stats] = await Promise.all([
      getGlobalLeaderboard(50),
      getMyStats(id),
    ])
    setGlobalEntries(global)
    setMyStats(stats)
    setLoading(false)
  }

  const handleSaveName = () => {
    const trimmed = playerNameInput.trim()
    if (!trimmed) return
    setPlayerName(trimmed)
    setCurrentPlayerName(trimmed)
    setEditingName(false)
    loadAll(myId)
  }

  const myGlobalRank = globalEntries.findIndex(e => e.player_id === myId) + 1

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="w-5 text-center text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return (
    <div className="min-h-screen bg-background p-4">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Trophy className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
      </div>

      {/* Player identity */}
      <div className="bg-card rounded-2xl p-4 border border-border mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          {editingName ? (
            <div className="flex-1 flex gap-2">
              <Input
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Enter your display name"
                className="flex-1"
                maxLength={20}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>✕</Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="font-semibold truncate">{currentPlayerName}</p>
                <p className="text-xs text-muted-foreground">
                  {myStats
                    ? `Rank #${myGlobalRank || "?"} · ${myStats.levels_completed} levels completed`
                    : "Complete levels to appear on the leaderboard"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingName(true)} className="flex-shrink-0 ml-3">
                Edit Name
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("global")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "global"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Global Rankings
        </button>
        <button
          onClick={() => setTab("personal")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "personal"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          My Stats
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >

            {/* ── GLOBAL TAB ─────────────────────────────── */}
            {tab === "global" && (
              <div className="space-y-2">

                {/* Column header */}
                {globalEntries.length > 0 && (
                  <div className="flex items-center gap-3 px-3 pb-1 text-xs font-medium text-muted-foreground">
                    <span className="w-8 text-center">Rank</span>
                    <span className="flex-1">Player</span>
                    <span className="w-20 text-center">Levels</span>
                    <span className="w-20 text-right">Score</span>
                  </div>
                )}

                {globalEntries.length === 0 ? (
                  <div className="text-center py-20">
                    <Trophy className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="font-semibold text-muted-foreground">No players yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Complete a level to claim the top spot!
                    </p>
                  </div>
                ) : (
                  globalEntries.map((entry, index) => {
                    const isMe = entry.player_id === myId
                    const isTop3 = index < 3
                    return (
                      <motion.div
                        key={entry.player_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`rounded-2xl px-3 py-3 border flex items-center gap-3 ${
                          isMe
                            ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                            : index === 0
                            ? "bg-yellow-400/8 border-yellow-400/25"
                            : "bg-card border-border"
                        }`}
                      >
                        {/* Rank icon */}
                        <div className="w-8 flex justify-center flex-shrink-0">
                          {getRankIcon(index + 1)}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold truncate ${isTop3 ? "text-base" : "text-sm"}`}>
                              {entry.player_name}
                            </p>
                            {isMe && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Reached level {entry.best_level}
                          </p>
                        </div>

                        {/* Levels completed */}
                        <div className="w-20 text-center flex-shrink-0">
                          <p className={`font-bold ${isTop3 ? "text-lg text-accent" : "text-sm"}`}>
                            {entry.levels_completed}
                          </p>
                          <p className="text-xs text-muted-foreground">levels</p>
                        </div>

                        {/* Total score */}
                        <div className="w-20 text-right flex-shrink-0">
                          <p className="font-bold text-sm">{entry.total_score.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* ── MY STATS TAB ───────────────────────────── */}
            {tab === "personal" && (
              <div className="space-y-4">
                {!myStats ? (
                  <div className="text-center py-20">
                    <Star className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="font-semibold text-muted-foreground">No stats yet</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Complete your first level to see your stats!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Global rank highlight */}
                    <div className={`rounded-3xl p-6 border text-center ${
                      myGlobalRank === 1
                        ? "bg-yellow-400/10 border-yellow-400/30"
                        : myGlobalRank <= 3
                        ? "bg-accent/10 border-accent/30"
                        : "bg-card border-border"
                    }`}>
                      <div className="flex justify-center mb-2">
                        {myGlobalRank === 1
                          ? <Crown className="h-10 w-10 text-yellow-400" />
                          : myGlobalRank === 2
                          ? <Medal className="h-10 w-10 text-gray-300" />
                          : myGlobalRank === 3
                          ? <Medal className="h-10 w-10 text-amber-600" />
                          : <Trophy className="h-10 w-10 text-accent" />
                        }
                      </div>
                      <p className="text-4xl font-black">
                        #{myGlobalRank || "—"}
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">Global Rank</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Ranked by levels completed
                      </p>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        icon={<Target className="h-5 w-5 text-green-400" />}
                        value={myStats.levels_completed.toString()}
                        label="Levels Completed"
                        bg="bg-green-400/10"
                      />
                      <StatCard
                        icon={<Trophy className="h-5 w-5 text-accent" />}
                        value={myStats.total_score.toLocaleString()}
                        label="Total Score"
                        bg="bg-accent/10"
                      />
                      <StatCard
                        icon={<Zap className="h-5 w-5 text-blue-400" />}
                        value={myStats.total_moves.toLocaleString()}
                        label="Total Moves"
                        bg="bg-blue-400/10"
                      />
                      <StatCard
                        icon={<Clock className="h-5 w-5 text-purple-400" />}
                        value={formatTime(myStats.total_time_seconds)}
                        label="Time Played"
                        bg="bg-purple-400/10"
                      />
                      <StatCard
                        icon={<Hash className="h-5 w-5 text-orange-400" />}
                        value={`Level ${myStats.best_level}`}
                        label="Furthest Level"
                        bg="bg-orange-400/10"
                        wide
                      />
                    </div>

                    {/* Average score hint */}
                    {myStats.levels_completed > 0 && (
                      <p className="text-center text-xs text-muted-foreground">
                        Avg score per level:{" "}
                        <span className="font-semibold text-foreground">
                          {Math.round(myStats.total_score / myStats.levels_completed).toLocaleString()} pts
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Refresh */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => loadAll(myId)} disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>
    </div>
  )
}

// ── Stat card helper ─────────────────────────────────────────

function StatCard({
  icon, value, label, bg, wide = false,
}: {
  icon: React.ReactNode
  value: string
  label: string
  bg: string
  wide?: boolean
}) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-4 flex items-center gap-3 ${wide ? "col-span-2" : ""}`}>
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-xl leading-tight truncate">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
