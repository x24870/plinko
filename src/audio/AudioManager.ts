export interface AudioManager {
  audioContext: AudioContext | null;
  enabled: boolean;
  volume: number;
  sfxVolume: number;
  musicVolume: number;
}

export function createAudioManager(): AudioManager {
  return {
    audioContext: null,
    enabled: false,
    volume: 0.5,
    sfxVolume: 0.7,
    musicVolume: 0.3,
  };
}

export function initializeAudio(audioManager: AudioManager): void {
  if (audioManager.audioContext) {
    console.log("Audio already initialized");
    return;
  }

  try {
    // Create AudioContext (works across browsers)
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    audioManager.audioContext = new AudioContextClass();
    audioManager.enabled = true;
    console.log("Audio system initialized");
  } catch (error) {
    console.warn("Failed to initialize audio:", error);
    audioManager.enabled = false;
  }
}

export function resumeAudioContext(audioManager: AudioManager): void {
  if (
    audioManager.audioContext &&
    audioManager.audioContext.state === "suspended"
  ) {
    audioManager.audioContext.resume().then(() => {
      console.log("Audio context resumed");
    });
  }
}

export function setMasterVolume(
  audioManager: AudioManager,
  volume: number
): void {
  audioManager.volume = Math.max(0, Math.min(1, volume));
}

export function setSFXVolume(audioManager: AudioManager, volume: number): void {
  audioManager.sfxVolume = Math.max(0, Math.min(1, volume));
}

export function setMusicVolume(
  audioManager: AudioManager,
  volume: number
): void {
  audioManager.musicVolume = Math.max(0, Math.min(1, volume));
}

export function toggleAudio(audioManager: AudioManager): boolean {
  audioManager.enabled = !audioManager.enabled;
  console.log(`Audio ${audioManager.enabled ? "enabled" : "disabled"}`);
  return audioManager.enabled;
}

// Procedurally generated sound effects
export function playCollisionSound(
  audioManager: AudioManager,
  velocity: number = 1
): void {
  if (!audioManager.enabled || !audioManager.audioContext) return;

  const ctx = audioManager.audioContext;
  const now = ctx.currentTime;

  // Create oscillator for impact sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Pitch based on velocity
  const frequency = 200 + velocity * 100;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

  // Volume envelope
  const volume = audioManager.volume * audioManager.sfxVolume * 0.1;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.type = "sine";
  osc.start(now);
  osc.stop(now + 0.1);
}

export function playScoreSound(
  audioManager: AudioManager,
  score: number
): void {
  if (!audioManager.enabled || !audioManager.audioContext) return;

  const ctx = audioManager.audioContext;
  const now = ctx.currentTime;

  // Create a pleasant chime sound
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  // Frequency based on score (higher score = higher pitch)
  const baseFreq = 400 + (score / 200) * 600; // 400-1000 Hz range
  osc1.frequency.setValueAtTime(baseFreq, now);
  osc2.frequency.setValueAtTime(baseFreq * 1.5, now); // Perfect fifth

  // Volume envelope
  const volume = audioManager.volume * audioManager.sfxVolume * 0.15;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc1.type = "sine";
  osc2.type = "sine";
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.3);
  osc2.stop(now + 0.3);
}

export function playSpawnSound(audioManager: AudioManager): void {
  if (!audioManager.enabled || !audioManager.audioContext) return;

  const ctx = audioManager.audioContext;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Ascending pitch for spawn
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

  const volume = audioManager.volume * audioManager.sfxVolume * 0.08;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.type = "triangle";
  osc.start(now);
  osc.stop(now + 0.1);
}

export function playResetSound(audioManager: AudioManager): void {
  if (!audioManager.enabled || !audioManager.audioContext) return;

  const ctx = audioManager.audioContext;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Descending sweep for reset
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

  const volume = audioManager.volume * audioManager.sfxVolume * 0.12;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  osc.type = "sawtooth";
  osc.start(now);
  osc.stop(now + 0.2);
}

// Simple background music (optional ambient sound)
let musicOscillator: OscillatorNode | null = null;
let musicGain: GainNode | null = null;

export function startBackgroundMusic(audioManager: AudioManager): void {
  if (!audioManager.enabled || !audioManager.audioContext) return;
  if (musicOscillator) return; // Already playing

  const ctx = audioManager.audioContext;

  // Create subtle ambient pad
  musicOscillator = ctx.createOscillator();
  musicGain = ctx.createGain();

  musicOscillator.connect(musicGain);
  musicGain.connect(ctx.destination);

  // Very low frequency for ambient feel
  musicOscillator.frequency.setValueAtTime(110, ctx.currentTime); // A2 note
  musicOscillator.type = "sine";

  // Very quiet volume
  const volume = audioManager.volume * audioManager.musicVolume * 0.05;
  musicGain.gain.setValueAtTime(volume, ctx.currentTime);

  musicOscillator.start();
  console.log("Background music started");
}

export function stopBackgroundMusic(): void {
  if (musicOscillator) {
    musicOscillator.stop();
    musicOscillator = null;
    musicGain = null;
    console.log("Background music stopped");
  }
}
