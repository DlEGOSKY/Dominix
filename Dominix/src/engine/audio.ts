type SoundName =
  | "tile_place"
  | "tile_hover"
  | "pattern_activate"
  | "round_win"
  | "round_lose"
  | "relic_select"
  | "button_click"
  | "score_tick";

interface SynthSound {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  decay?: number;
}

const SYNTH_SOUNDS: Record<SoundName, SynthSound> = {
  tile_place: { frequency: 440, duration: 0.08, type: "sine", volume: 0.3 },
  tile_hover: { frequency: 600, duration: 0.03, type: "sine", volume: 0.1 },
  pattern_activate: { frequency: 880, duration: 0.15, type: "triangle", volume: 0.4, decay: 0.1 },
  round_win: { frequency: 523, duration: 0.3, type: "sine", volume: 0.5 },
  round_lose: { frequency: 220, duration: 0.4, type: "sawtooth", volume: 0.3 },
  relic_select: { frequency: 660, duration: 0.12, type: "sine", volume: 0.35 },
  button_click: { frequency: 800, duration: 0.05, type: "square", volume: 0.15 },
  score_tick: { frequency: 1000, duration: 0.02, type: "sine", volume: 0.1 },
};

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sfxVolume = 0.5;
  private muted = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  play(name: SoundName) {
    if (this.muted) return;

    const config = SYNTH_SOUNDS[name];
    if (!config) return;

    try {
      const ctx = this.getContext();
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

    try {
      const ctx = this.getContext();
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
