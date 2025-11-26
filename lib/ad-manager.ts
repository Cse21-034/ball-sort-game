// Ad Manager for rewarded ads
// This is a simulated ad system - in production, replace with actual ad SDK

export interface AdReward {
  type: "coins" | "hint" | "undo"
  amount: number
}

class AdManager {
  private isAdReady = true
  private lastAdTime = 0
  private adCooldown = 30000 // 30 seconds between ads

  // Check if an ad is ready to show
  isReady(): boolean {
    const now = Date.now()
    return this.isAdReady && now - this.lastAdTime > this.adCooldown
  }

  // Get time until next ad is available (in seconds)
  getCooldownRemaining(): number {
    const now = Date.now()
    const timeSinceLastAd = now - this.lastAdTime
    const remaining = Math.max(0, this.adCooldown - timeSinceLastAd)
    return Math.ceil(remaining / 1000)
  }

  // Show a rewarded ad (simulated)
  async showRewardedAd(rewardType: "coins" | "hint" | "undo"): Promise<AdReward | null> {
    if (!this.isReady()) {
      return null
    }

    // Simulate ad loading
    return new Promise((resolve) => {
      // Simulate ad duration (2-4 seconds)
      const adDuration = 2000 + Math.random() * 2000

      setTimeout(() => {
        this.lastAdTime = Date.now()

        // Determine reward
        const reward: AdReward = {
          type: rewardType,
          amount: rewardType === "coins" ? 25 : rewardType === "hint" ? 1 : 3,
        }

        resolve(reward)
      }, adDuration)
    })
  }

  // Show interstitial ad (between levels)
  async showInterstitialAd(): Promise<boolean> {
    // Only show interstitial every 3 levels
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1500)
    })
  }
}

export const adManager = new AdManager()
