/**
 * Ambient music engine — synthesizes per-act drones using Web Audio.
 *
 * Each act has its own scene (chord color, pulse, filter). Scenes crossfade
 * smoothly on transition. A boss overlay can be turned on/off to add tension
 * without changing the underlying scene.
 *
 * No external audio assets — everything is oscillator-driven so it ships for
 * free and works offline.
 */

import type { ActId } from "./acts";

export type SceneId = ActId;

interface LayerSpec {
  /** Fundamental frequency in Hz. */
  freq: number;
  /** Oscillator waveform. */
  type: OscillatorType;
  /** Gain at steady state (relative, 0..1). */
  gain: number;
  /** Optional detune in cents for a thicker sound. */
  detune?: number;
  /** Optional low-pass filter cutoff. */
  filter?: number;
  /** Optional LFO modulating gain for slow breathing. */
  lfo?: { rate: number; depth: number };
}

interface SceneSpec {
  id: SceneId;
  layers: LayerSpec[];
}

// Design principles for these scenes:
// - Subliminal volume: these are atmospheres, not tunes. Low gains per layer.
// - 2 layers max per scene. Extra layers create beating/interference.
// - LFOs at < 0.15 Hz so modulation is breathing, not pulsing.
// - Dark filters (300-600 Hz cutoff) so sine/triangle reads as "distant"
//   instead of a raw oscillator.
// - Small intervals per scene to evoke tonality without chord collisions.
const SCENES: Record<SceneId, SceneSpec> = {
  umbral: {
    id: "umbral",
    layers: [
      // Soft low perfect 5th — calm, neutral
      { freq: 55.0, type: "sine", gain: 0.09, filter: 400, lfo: { rate: 0.05, depth: 0.25 } }, // A1
      { freq: 82.41, type: "sine", gain: 0.05, filter: 500, lfo: { rate: 0.07, depth: 0.3 } }, // E2
    ],
  },
  travesia: {
    id: "travesia",
    layers: [
      // Slightly brighter — 4th up, minor flavor
      { freq: 73.42, type: "sine", gain: 0.09, filter: 450, lfo: { rate: 0.06, depth: 0.25 } }, // D2
      { freq: 98.0, type: "sine", gain: 0.05, filter: 550, lfo: { rate: 0.08, depth: 0.3 } }, // G2
    ],
  },
  culminacion: {
    id: "culminacion",
    layers: [
      // Deep ritual — root + minor 3rd up an octave for tension without clash
      { freq: 49.0, type: "sine", gain: 0.10, filter: 380, lfo: { rate: 0.04, depth: 0.3 } }, // G1
      { freq: 116.54, type: "sine", gain: 0.04, filter: 520, lfo: { rate: 0.09, depth: 0.25 } }, // Bb2
    ],
  },
  eco: {
    id: "eco",
    layers: [
      // Disonant but sparse: slight detune on root layer
      { freq: 46.25, type: "sine", gain: 0.10, filter: 350, lfo: { rate: 0.03, depth: 0.35 } }, // F#1
      { freq: 49.0, type: "sine", gain: 0.05, filter: 400, detune: -12, lfo: { rate: 0.06, depth: 0.3 } }, // G1 slightly detuned
    ],
  },
};

// Boss overlay: a single sub-octave triangle. Very subtle; adds weight,
// not drama. Combined with audio.playBossRage() for the real moments.
const BOSS_LAYERS: LayerSpec[] = [
  { freq: 41.2, type: "triangle", gain: 0.06, filter: 280, lfo: { rate: 0.05, depth: 0.25 } },
];

interface ActiveLayer {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
  lfoOsc?: OscillatorNode;
  lfoGain?: GainNode;
  baseGain: number;
}

const CROSSFADE_SECONDS = 3.5;

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeLayers: ActiveLayer[] = [];
  private bossLayers: ActiveLayer[] = [];
  private currentSceneId: SceneId | null = null;
  private bossActive = false;
  private volume = 0.15;
  private muted = false;
  private subscribers = new Set<() => void>();

  constructor() {
    if (typeof window !== "undefined") {
      // v2 key: the v1 default was too loud and saved values pre-retune would
      // still feel like interference. Starting fresh for everyone.
      const storedVol = localStorage.getItem("dominix_music_volume_v2");
      const storedMute = localStorage.getItem("dominix_music_muted");
      if (storedVol != null) this.volume = Math.max(0, Math.min(1, parseFloat(storedVol)));
      if (storedMute != null) this.muted = storedMute === "1";
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : this.volume;
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  private buildLayer(spec: LayerSpec, targetGain: GainNode): ActiveLayer | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = spec.type;
    osc.frequency.value = spec.freq;
    if (spec.detune != null) osc.detune.value = spec.detune;

    filter.type = "lowpass";
    filter.frequency.value = spec.filter ?? 2000;
    // Gentle Q: avoid any ringing or nasal resonance — we want "muffled"
    // not "singing".
    filter.Q.value = 0.3;

    gain.gain.value = 0; // will fade in

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetGain);
    osc.start();

    const active: ActiveLayer = { osc, gain, filter, baseGain: spec.gain };

    if (spec.lfo) {
      const lfoOsc = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfoOsc.frequency.value = spec.lfo.rate;
      lfoGain.gain.value = spec.gain * spec.lfo.depth;
      lfoOsc.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfoOsc.start();
      active.lfoOsc = lfoOsc;
      active.lfoGain = lfoGain;
    }

    return active;
  }

  private fadeIn(layer: ActiveLayer, seconds: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
    layer.gain.gain.linearRampToValueAtTime(layer.baseGain, now + seconds);
  }

  private fadeOut(layer: ActiveLayer, seconds: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(layer.gain.gain.value, now);
    layer.gain.gain.linearRampToValueAtTime(0, now + seconds);
    // Stop the oscillators slightly after the fade completes
    try {
      layer.osc.stop(now + seconds + 0.1);
      if (layer.lfoOsc) layer.lfoOsc.stop(now + seconds + 0.1);
    } catch {
      // Already stopped
    }
  }

  /** Start or crossfade to a new scene. Idempotent if already there. */
  setScene(sceneId: SceneId) {
    if (this.currentSceneId === sceneId) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    // Resume if suspended (common first-play case in browsers)
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // Fade out previous scene layers
    for (const layer of this.activeLayers) this.fadeOut(layer, CROSSFADE_SECONDS);
    this.activeLayers = [];

    // Build new scene
    const scene = SCENES[sceneId];
    if (!scene) return;
    for (const spec of scene.layers) {
      const layer = this.buildLayer(spec, this.masterGain);
      if (layer) {
        this.activeLayers.push(layer);
        this.fadeIn(layer, CROSSFADE_SECONDS);
      }
    }
    this.currentSceneId = sceneId;
  }

  /** Add or remove the boss intensity overlay. */
  setBossActive(active: boolean) {
    if (this.bossActive === active) return;
    this.bossActive = active;
    if (!this.masterGain) return;
    if (active) {
      for (const spec of BOSS_LAYERS) {
        const layer = this.buildLayer(spec, this.masterGain);
        if (layer) {
          this.bossLayers.push(layer);
          this.fadeIn(layer, 0.8);
        }
      }
    } else {
      for (const layer of this.bossLayers) this.fadeOut(layer, 1.2);
      this.bossLayers = [];
    }
  }

  /** Stop all music immediately (e.g. on returning to home). */
  stopAll() {
    for (const layer of this.activeLayers) this.fadeOut(layer, 0.8);
    for (const layer of this.bossLayers) this.fadeOut(layer, 0.8);
    this.activeLayers = [];
    this.bossLayers = [];
    this.currentSceneId = null;
    this.bossActive = false;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem("dominix_music_volume_v2", this.volume.toString());
    if (this.masterGain && !this.muted) this.masterGain.gain.value = this.volume;
    this.subscribers.forEach((fn) => fn());
  }

  getVolume() {
    return this.volume;
  }

  setMuted(m: boolean) {
    this.muted = m;
    localStorage.setItem("dominix_music_muted", m ? "1" : "0");
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this.volume;
    this.subscribers.forEach((fn) => fn());
  }

  isMuted() {
    return this.muted;
  }

  subscribe(fn: () => void) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }
}

export const ambient = new AmbientEngine();
