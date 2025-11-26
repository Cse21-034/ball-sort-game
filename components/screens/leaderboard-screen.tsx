"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Trophy, Medal, Crown, User, Clock, Target, Loader2 } from "lucide-react"
import {
  getGlobalLeaderboard,
  getPlayerBestScores,
  getPlayerId,
  getPlayerName,
  setPlayerName,
  type LeaderboardEntry,
} from "@/lib/leaderboard"

interface LeaderboardScreenProps {
  onBack: () => void
}

type Tab = "global" | "personal"

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [tab, setTab] = useState<Tab>("global")
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([])
  const [personalEntries, setPersonalEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [playerNameInput, setPlayerNameInput] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [currentPlayerName, setCurrentPlayerName] = useState("Player")

  useEffect(() => {
    loadLeaderboard()
    setCurrentPlayerName(getPlayerName())
    setPlayerNameInput(getPlayerName())
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const [global, personal] = await Promise.all([getGlobalLeaderboard(50), getPlayerBestScores(getPlayerId())])
    setGlobalEntries(global)
    setPersonalEntries(personal)
    setLoading(false)
  }

  const handleSaveName = () => {
    if (playerNameInput.trim()) {
      setPlayerName(playerNameInput.trim())
      setCurrentPlayerName(playerNameInput.trim())
      setEditingName(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="w-5 text-center text-sm text-muted-foreground">#{rank}</span>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

      {/* Player name section */}
      <div className="bg-card rounded-xl p-4 border border-border mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <User className="h-5 w-5 text-primary" />
          </div>
          {editingName ? (
            <div className="flex-1 flex gap-2">
              <Input
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Enter your name"
                className="flex-1"
                maxLength={20}
              />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentPlayerName}</p>
                <p className="text-xs text-muted-foreground">Your display name</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingName(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === "global" ? "default" : "outline"} className="flex-1" onClick={() => setTab("global")}>
          Global
        </Button>
        <Button
          variant={tab === "personal" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setTab("personal")}
        >
          My Scores
        </Button>
      </div>

      {/* Leaderboard content */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {(tab === "global" ? globalEntries : personalEntries).length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {tab === "global" ? "No scores yet. Be the first!" : "Complete levels to see your scores here!"}
                  </p>
                </div>
              ) : (
                (tab === "global" ? globalEntries : personalEntries).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-card rounded-xl p-4 border ${
                      entry.player_id === getPlayerId() ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{entry.player_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Lv.{entry.level_id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(entry.time_seconds)}
                          </span>
                          <span>{entry.moves} moves</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{entry.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Refresh button */}
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={loadLeaderboard} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>
    </div>
  )
}
