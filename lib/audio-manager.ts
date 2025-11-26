class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicEnabled = true
  private soundEnabled = true
  private currentMusic: HTMLAudioElement | null = null

  init() {
    if (typeof window === "undefined") return

    // Preload sound effects (using placeholder URLs)
    this.preloadSound("click", "/sounds/click.mp3")
    this.preloadSound("move", "/sounds/move.mp3")
    this.preloadSound("complete", "/sounds/complete.mp3")
    this.preloadSound("win", "/sounds/win.mp3")
    this.preloadSound("error", "/sounds/error.mp3")
  }

  private preloadSound(name: string, url: string) {
    // For demo, we'll use Web Audio API beeps instead of actual files
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (!enabled && this.currentMusic) {
      this.currentMusic.pause()
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  playSound(name: "click" | "move" | "complete" | "win" | "error") {
    if (!this.soundEnabled || typeof window === "undefined") return

    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequencies: Record<string, number> = {
        click: 800,
        move: 600,
        complete: 1000,
        win: 1200,
        error: 300,
      }

      oscillator.frequency.value = frequencies[name] || 600
      oscillator.type = "sine"
      gainNode.gain.value = 0.1

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Audio not supported
    }
  }
}

export const audioManager = new AudioManager()
