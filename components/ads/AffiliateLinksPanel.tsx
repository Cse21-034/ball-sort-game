"use client"

// ============================================================
// components/ads/AffiliateLinksPanel.tsx
// Shows your affiliate links as a beautiful in-game panel
// ============================================================

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Tag, Star, Gift } from "lucide-react"
import { getActiveAffiliateLinks, type AffiliateLink } from "@/lib/ads-config"
//import { trackAffiliateClick } from "@/lib/ad-tracker"
// NEW
import { trackAffiliateClick } from "@/lib/ad-tracker-db"
interface AffiliateLinksProps {
  isOpen: boolean
  onClose: () => void
  onReward?: (type: string, amount: number) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  gaming: "🎮",
  apps: "📱",
  shopping: "🛍️",
  food: "🍕",
  services: "⚡",
  finance: "💰",
  health: "💪",
}

export function AffiliateLinksPanel({
  isOpen,
  onClose,
  onReward,
}: AffiliateLinksProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())
  const links = getActiveAffiliateLinks()
  const featuredLinks = links.filter((l) => l.featured)
  const regularLinks = links.filter((l) => !l.featured)

  const handleLinkClick = (link: AffiliateLink) => {
    trackAffiliateClick(link.id, link.name)
    setClickedLinks((prev) => new Set([...prev, link.id]))

    // Give reward if configured (only once per session)
    if (link.reward && !clickedLinks.has(link.id) && onReward) {
      onReward(link.reward.type, link.reward.amount)
    }

    window.open(link.affiliateUrl, "_blank", "noopener,noreferrer")
  }

  if (links.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card rounded-3xl w-full max-w-sm max-h-[80vh] overflow-hidden border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-bold">Deals & Offers</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Featured */}
              {featuredLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                  <div className="space-y-2">
                    {featuredLinks.map((link) => (
                      <AffiliateLinkCard
                        key={link.id}
                        link={link}
                        clicked={clickedLinks.has(link.id)}
                        featured
                        onClick={() => handleLinkClick(link)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular */}
              {regularLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      More Offers
                    </span>
                  </div>
                  <div className="space-y-2">
                    {regularLinks.map((link) => (
                      <AffiliateLinkCard
                        key={link.id}
                        link={link}
                        clicked={clickedLinks.has(link.id)}
                        onClick={() => handleLinkClick(link)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground/60 pb-2">
                Some links may earn us a commission
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Individual link card ───────────────────────────────────

interface AffiliateLinkCardProps {
  link: AffiliateLink
  clicked: boolean
  featured?: boolean
  onClick: () => void
}

function AffiliateLinkCard({
  link,
  clicked,
  featured,
  onClick,
}: AffiliateLinkCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 border transition-colors flex items-center gap-3 ${
        featured
          ? "bg-accent/10 border-accent/30 hover:bg-accent/15"
          : "bg-secondary/50 border-border hover:bg-secondary"
      }`}
    >
      {/* Icon / Logo */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-2xl">
        {link.logoUrl ? (
          <img
            src={link.logoUrl}
            alt={link.name}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <span>{CATEGORY_ICONS[link.category] || "🔗"}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm truncate">{link.name}</span>
          {link.badgeText && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
              {link.badgeText}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {link.description}
        </p>
        {link.reward && !clicked && (
          <div className="flex items-center gap-1 mt-1">
            <Gift className="h-3 w-3 text-accent" />
            <span className="text-xs text-accent font-medium">
              +{link.reward.amount} {link.reward.type} bonus
            </span>
          </div>
        )}
        {clicked && link.reward && (
          <span className="text-xs text-green-500 font-medium">✓ Reward claimed!</span>
        )}
      </div>

      {/* Arrow */}
      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </motion.button>
  )
}
