type SoundName =
  | "tile_place"
  | "tile_hover"
  | "pattern_activate"
  | "pattern_combo"
  | "pattern_mega"
  | "round_win"
  | "round_lose"
  | "relic_select"
  | "button_click"
  | "score_tick"
  | "pact_play"
  | "alignment"
  | "cosmic"
  | "boss_rage"
  | "discard_tile"
  | "draw_tile"
  | "boss_enter"
  | "event_good"
  | "event_bad"
  | "chain_clear"
  | "score_big"
  | "shop_buy";

interface SynthSound {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  decay?: number;
}

const SYNTH_SOUNDS: Record<SoundName, SynthSound> = {
  tile_place:       { frequency: 440,  duration: 0.08, type: "sine",     volume: 0.3  },
  tile_hover:       { frequency: 600,  duration: 0.03, type: "sine",     volume: 0.1  },
  pattern_activate: { frequency: 880,  duration: 0.15, type: "triangle", volume: 0.4,  decay: 0.10 },
  pattern_combo:    { frequency: 988,  duration: 0.18, type: "triangle", volume: 0.45, decay: 0.12 },
  pattern_mega:     { frequency: 1174, duration: 0.25, type: "triangle", volume: 0.5,  decay: 0.15 },
  round_win:        { frequency: 523,  duration: 0.3,  type: "sine",     volume: 0.5  },
  round_lose:       { frequency: 220,  duration: 0.4,  type: "sawtooth", volume: 0.3  },
  relic_select:     { frequency: 660,  duration: 0.12, type: "sine",     volume: 0.35 },
  button_click:     { frequency: 800,  duration: 0.05, type: "square",   volume: 0.15 },
  score_tick:       { frequency: 1000, duration: 0.02, type: "sine",     volume: 0.1  },
  pact_play:        { frequency: 523,  duration: 0.35, type: "sine",     volume: 0.5,  decay: 0.20 },
  alignment:        { frequency: 784,  duration: 0.22, type: "sine",     volume: 0.45, decay: 0.15 },
  cosmic:           { frequency: 1047, duration: 0.5,  type: "sine",     volume: 0.55, decay: 0.30 },
  boss_rage:        { frequency: 147,  duration: 0.4,  type: "sawtooth", volume: 0.4,  decay: 0.20 },
  // ---- S9: new SFX ----
  discard_tile:     { frequency: 320,  duration: 0.06, type: "triangle", volume: 0.22 },
  draw_tile:        { frequency: 540,  duration: 0.07, type: "sine",     volume: 0.20 },
  boss_enter:       { frequency: 98,   duration: 0.6,  type: "sawtooth", volume: 0.5,  decay: 0.35 },
  event_good:       { frequency: 698,  duration: 0.18, type: "sine",     volume: 0.38, decay: 0.12 },
  event_bad:        { frequency: 233,  duration: 0.22, type: "sawtooth", volume: 0.32, decay: 0.15 },
  chain_clear:      { frequency: 740,  duration: 0.14, type: "triangle", volume: 0.35, decay: 0.08 },
  score_big:        { frequency: 1318, duration: 0.3,  type: "sine",     volume: 0.45, decay: 0.18 },
  shop_buy:         { frequency: 587,  duration: 0.1,  type: "sine",     volume: 0.30, decay: 0.06 },
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sfxVolume = 0.5;
  private muted = false;

  /**
   * Returns the live AudioContext only if it exists AND is running.
   * Returning null means callers should silently no-op — they MUST NOT
   * create or resume a context themselves, because both operations are
   * only allowed inside a real user-gesture handler (Chrome / Safari
   * autoplay policy). The very first user gesture goes through unlock().
   */
  private getRunningContext(): AudioContext | null {
    const ctx = this.audioContext;
    if (!ctx) return null;
    if (ctx.state !== "running") return null;
    return ctx;
  }

  /**
   * Resume the audio context if it is suspended (required by mobile / Safari
   * autoplay policies). MUST be called from a user gesture handler.
   * This is the only place that creates the AudioContext; lazy creation
   * elsewhere triggers hundreds of "AudioContext was not allowed to start"
   * warnings during a long run.
   */
  unlock(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      if (this.audioContext.state === "suspended") {
        void this.audioContext.resume();
      }
    } catch {
      // No-op if AudioContext not available
    }
  }

  play(name: SoundName) {
    if (this.muted) return;

    const config = SYNTH_SOUNDS[name];
    if (!config) return;

    const ctx = this.getRunningContext();
    if (!ctx) return; // Silent until the first gesture unlocks audio.

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      const volume = config.volume * this.sfxVolume;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + config.duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch {
      // Audio not supported or blocked
    }
  }

  playChord(notes: number[], duration: number = 0.3) {
    if (this.muted) return;

    const ctx = this.getRunningContext();
    if (!ctx) return; // Silent until the first gesture unlocks audio.

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2 * this.sfxVolume, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      masterGain.connect(ctx.destination);

      for (const freq of notes) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      }
    } catch {
      // Audio not supported
    }
  }

  playWinFanfare() {
    this.playChord([523, 659, 784], 0.2);
    setTimeout(() => this.playChord([587, 740, 880], 0.2), 150);
    setTimeout(() => this.playChord([659, 784, 1047], 0.4), 300);
  }

  playLoseSting() {
    this.playChord([293, 349, 440], 0.3);
    setTimeout(() => this.playChord([261, 311, 392], 0.5), 250);
  }

  /**
   * Play a pattern sound whose intensity scales with the number of patterns
   * simultaneously activated on that play. 1 → simple, 2-3 → combo,
   * 4+ → mega. Legendary-tier patterns can force the mega tier even alone.
   */
  playPatternByTier(patternCount: number, forceMega: boolean = false) {
    if (this.muted) return;
    if (forceMega || patternCount >= 4) {
      this.play("pattern_mega");
      setTimeout(() => this.playChord([659, 784, 988], 0.22), 40);
    } else if (patternCount >= 2) {
      this.play("pattern_combo");
      setTimeout(() => this.playChord([587, 740], 0.15), 30);
    } else {
      this.play("pattern_activate");
    }
  }

  /** Warm, affirming chord for when a celestial alignment first activates. */
  playAlignmentChord() {
    this.playChord([523, 659, 784], 0.25);
  }

  /** Wide, shimmering chord for cosmic alignment — the biggest positive sfx. */
  playCosmicChord() {
    this.playChord([523, 659, 784, 988, 1175], 0.55);
  }

  /** Deep rumble when the boss reaches 100% Furor. */
  playBossRage() {
    this.play("boss_rage");
    setTimeout(() => this.playChord([110, 146], 0.3), 80);
  }

  /** Glowing single-shot for playing the pact tile — majestic. */
  playPactHit() {
    this.play("pact_play");
    setTimeout(() => this.playChord([659, 784, 988], 0.25), 60);
  }

  /** Heavy intro when a boss round is revealed — two-chord dark accent. */
  playBossEnter() {
    this.play("boss_enter");
    setTimeout(() => this.playChord([98, 123], 0.45), 120);
  }

  /** Crisp upward sweep when the player submits a chain. */
  playChainClear() {
    this.play("chain_clear");
    setTimeout(() => this.playChord([740, 880], 0.12), 50);
  }

  /** Bright shimmer for a dominant-score round (>= 200% of target). */
  playScoreBig() {
    this.play("score_big");
    setTimeout(() => this.playChord([1047, 1319, 1568], 0.25), 60);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    localStorage.setItem("dominix_muted", muted ? "1" : "0");
  }

  isMuted() {
    return this.muted;
  }

  loadMutedState() {
    this.muted = localStorage.getItem("dominix_muted") === "1";
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
}

export const audio = new AudioManager();
audio.loadMutedState();

export type { SoundName };
