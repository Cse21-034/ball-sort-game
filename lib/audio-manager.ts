// ============================================================
// lib/audio-manager.ts
// Full audio system:
//   - Sound effects via Web Audio API
//   - Default background music (procedurally generated)
//   - Phone music: user picks a file from their device
// ============================================================

class AudioManager {
  private audioContext: AudioContext | null = null
  private musicEnabled = true
  private soundEnabled = true

  // ── Background music state ──────────────────────────────
  private musicSource: AudioBufferSourceNode | null = null
  private musicGain: GainNode | null = null
  private musicBuffer: AudioBuffer | null = null
  private musicLoop = true
  private musicIsPlaying = false

  // ── User phone music state ──────────────────────────────
  private userMusicElement: HTMLAudioElement | null = null
  private userMusicMode = false   // true = playing user file, false = default

  // ── Init ────────────────────────────────────────────────

  init() {
    if (typeof window === "undefined") return
    // AudioContext must be created after a user gesture — defer
    // We create it lazily on first sound/music play
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.audioContext || this.audioContext.state === "closed") {
      try {
        this.audioContext = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
      } catch {
        return null
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  // ── Sound effects ───────────────────────────────────────

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  playSound(name: "click" | "move" | "complete" | "win" | "error") {
    if (!this.soundEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      const configs: Record<string, { freq: number; type: OscillatorType; duration: number; ramp: number }> = {
        click:    { freq: 880,  type: "sine",     duration: 0.06, ramp: 0.06 },
        move:     { freq: 660,  type: "sine",     duration: 0.08, ramp: 0.08 },
        complete: { freq: 1047, type: "triangle", duration: 0.25, ramp: 0.25 },
        win:      { freq: 1319, type: "triangle", duration: 0.5,  ramp: 0.5  },
        error:    { freq: 220,  type: "sawtooth", duration: 0.15, ramp: 0.15 },
      }

      const c = configs[name]
      osc.frequency.value = c.freq
      osc.type = c.type
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.ramp)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + c.duration)

      // Win plays ascending chord
      if (name === "win") {
        const notes = [1047, 1319, 1568, 2093]
        notes.forEach((freq, i) => {
          const o2 = ctx.createOscillator()
          const g2 = ctx.createGain()
          o2.connect(g2)
          g2.connect(ctx.destination)
          o2.frequency.value = freq
          o2.type = "triangle"
          g2.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12)
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4 + i * 0.12)
          o2.start(ctx.currentTime + i * 0.12)
          o2.stop(ctx.currentTime + 0.5 + i * 0.12)
        })
      }
    } catch {
      // silently fail
    }
  }

  // ── Music: enabled / disabled ───────────────────────────

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (enabled) {
      this.resumeMusic()
    } else {
      this.pauseMusic()
    }
  }

  // ── Default music: procedurally generated ambient loop ──

  /**
   * Build a looping ~16-second ambient track using Web Audio API.
   * Uses pentatonic chord stabs + slow pad + subtle arpeggio.
   */
  private async buildDefaultMusicBuffer(): Promise<AudioBuffer | null> {
    const ctx = this.getContext()
    if (!ctx) return null

    const BPM = 90
    const BEAT = 60 / BPM
    const BARS = 8
    const DURATION = BEAT * 4 * BARS  // 8 bars

    const sampleRate = ctx.sampleRate
    const totalSamples = Math.ceil(DURATION * sampleRate)
    const buffer = ctx.createBuffer(2, totalSamples, sampleRate)

    const L = buffer.getChannelData(0)
    const R = buffer.getChannelData(1)

    // Pentatonic scale in C: C4 E4 G4 A4 C5 E5 G5
    const PENTA = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99]

    // Helper: add a sine wave burst at time t, freq, amplitude, duration
    const addSine = (
      freq: number,
      startSec: number,
      durSec: number,
      amp: number,
      pan = 0
    ) => {
      const start = Math.floor(startSec * sampleRate)
      const len = Math.floor(durSec * sampleRate)
      const fade = Math.floor(0.05 * sampleRate) // 50ms fade

      for (let i = 0; i < len && start + i < totalSamples; i++) {
        const t = i / sampleRate
        const env =
          i < fade
            ? i / fade
            : i > len - fade
            ? (len - i) / fade
            : 1
        const val = Math.sin(2 * Math.PI * freq * t) * amp * env

        // Slight detuned overtone for richness
        const val2 = Math.sin(2 * Math.PI * freq * 2.003 * t) * amp * 0.25 * env

        L[start + i] += val * (1 - pan * 0.5) + val2 * (1 - pan * 0.3)
        R[start + i] += val * (1 + pan * 0.5) + val2 * (1 + pan * 0.3)
      }
    }

    // Slow pad: root chord C-E-G every 4 beats
    for (let bar = 0; bar < BARS; bar++) {
      const t = bar * BEAT * 4
      addSine(PENTA[0], t, BEAT * 4, 0.06, -0.2) // C
      addSine(PENTA[1], t, BEAT * 4, 0.05,  0.0) // E
      addSine(PENTA[2], t, BEAT * 4, 0.05,  0.2) // G
    }

    // Arpeggio: 8th notes cycling through pentatonic
    for (let beat = 0; beat < BARS * 4 * 2; beat++) {
      const t = beat * BEAT * 0.5
      const note = PENTA[beat % PENTA.length]
      const pan = ((beat % 4) - 1.5) / 3
      addSine(note, t, BEAT * 0.4, 0.04, pan)
    }

    // Soft bass: C2 on beats 1 and 3
    for (let bar = 0; bar < BARS; bar++) {
      addSine(65.41, bar * BEAT * 4,          BEAT * 1.5, 0.07, 0)
      addSine(65.41, bar * BEAT * 4 + BEAT * 2, BEAT * 1.2, 0.06, 0)
    }

    // Normalize to avoid clipping
    let peak = 0
    for (let i = 0; i < totalSamples; i++) {
      peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
    }
    if (peak > 0.9) {
      const scale = 0.9 / peak
      for (let i = 0; i < totalSamples; i++) {
        L[i] *= scale
        R[i] *= scale
      }
    }

    return buffer
  }

  async startDefaultMusic() {
    if (!this.musicEnabled || this.musicIsPlaying) return
    if (this.userMusicMode) return  // user music takes precedence

    const ctx = this.getContext()
    if (!ctx) return

    try {
      // Build buffer if not cached
      if (!this.musicBuffer) {
        this.musicBuffer = await this.buildDefaultMusicBuffer()
      }
      if (!this.musicBuffer) return

      // Gain node for volume control
      if (!this.musicGain) {
        this.musicGain = ctx.createGain()
        this.musicGain.gain.value = 0.4
        this.musicGain.connect(ctx.destination)
      }

      const source = ctx.createBufferSource()
      source.buffer = this.musicBuffer
      source.loop = true
      source.connect(this.musicGain)
      source.start()

      this.musicSource = source
      this.musicIsPlaying = true

      source.onended = () => {
        this.musicIsPlaying = false
      }
    } catch {
      // silently fail
    }
  }

  private stopDefaultMusic() {
    if (this.musicSource) {
      try { this.musicSource.stop() } catch { /* already stopped */ }
      this.musicSource = null
    }
    this.musicIsPlaying = false
  }

  private pauseMusic() {
    if (this.userMusicMode && this.userMusicElement) {
      this.userMusicElement.pause()
    } else {
      // Web Audio API doesn't "pause" — we suspend the context
      this.audioContext?.suspend()
    }
    this.musicIsPlaying = false
  }

  private resumeMusic() {
    if (this.userMusicMode && this.userMusicElement) {
      this.userMusicElement.play().catch(() => {})
      this.musicIsPlaying = true
    } else {
      this.audioContext?.resume()
      if (!this.musicIsPlaying) {
        this.startDefaultMusic()
      } else {
        this.musicIsPlaying = true
      }
    }
  }

  // ── User phone music ────────────────────────────────────

  /**
   * Called when user picks a file from their device.
   * Stops default music and plays the user's file.
   * Returns the track name (filename without extension).
   */
  loadUserMusic(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Stop default music
      this.stopDefaultMusic()

      // Clean up previous user audio element
      if (this.userMusicElement) {
        this.userMusicElement.pause()
        URL.revokeObjectURL(this.userMusicElement.src)
        this.userMusicElement = null
      }

      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      audio.loop = true
      audio.volume = 0.5

      audio.addEventListener("canplaythrough", () => {
        this.userMusicElement = audio
        this.userMusicMode = true

        if (this.musicEnabled) {
          audio.play().catch(() => {})
          this.musicIsPlaying = true
        }

        const name = file.name.replace(/\.[^/.]+$/, "") // strip extension
        resolve(name)
      }, { once: true })

      audio.addEventListener("error", () => {
        reject(new Error("Could not load audio file"))
      }, { once: true })
    })
  }

  /**
   * Stop user music and go back to default music.
   */
  switchToDefaultMusic() {
    if (this.userMusicElement) {
      this.userMusicElement.pause()
      URL.revokeObjectURL(this.userMusicElement.src)
      this.userMusicElement = null
    }
    this.userMusicMode = false
    this.musicIsPlaying = false
    this.musicBuffer = null  // rebuild so it restarts fresh

    if (this.musicEnabled) {
      this.startDefaultMusic()
    }
  }

  isPlayingUserMusic(): boolean {
    return this.userMusicMode
  }

  getUserMusicName(): string {
    return this.userMusicElement?.src
      ? decodeURIComponent(this.userMusicElement.src.split("/").pop() ?? "Custom Track")
      : "Custom Track"
  }

  getMusicEnabled(): boolean {
    return this.musicEnabled
  }

  isMusicPlaying(): boolean {
    return this.musicIsPlaying
  }
}

export const audioManager = new AudioManager()
