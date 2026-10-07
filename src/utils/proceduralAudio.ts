import { AudioTrack, AudioPlaylist, SyntheticPreset } from '../types/focus';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;

// Track active synthetic nodes
let activeOscillators: OscillatorNode[] = [];
let activeBufferSources: AudioBufferSourceNode[] = [];
let activeGainNodes: GainNode[] = [];
let activeLFOs: OscillatorNode[] = [];
let activeIntervals: number[] = [];
let currentSyntheticPreset: SyntheticPreset | null = null;

// HTML Audio for imported blobs
let importedAudioElement: HTMLAudioElement | null = null;
let mediaElementSource: MediaElementAudioSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // compact for smooth high-fps visualization
    analyser.smoothingTimeConstant = 0.8;

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAudioAnalyser(): AnalyserNode | null {
  return analyser;
}

export function getVisualizerData(): Uint8Array {
  if (!analyser) return new Uint8Array(32);
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  return data;
}

export function setMasterVolume(volumePercent: number, fadeSeconds = 0) {
  try {
    const ctx = getAudioContext();
    if (!masterGain) return;
    const targetGain = Math.max(0, Math.min(1, volumePercent / 100));
    if (fadeSeconds > 0) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + fadeSeconds);
    } else {
      masterGain.gain.setValueAtTime(targetGain, ctx.currentTime);
    }
  } catch (err) {
    console.warn('Error setting master volume', err);
  }
}

export function stopAllAudio(fadeSeconds = 0) {
  try {
    if (fadeSeconds > 0 && masterGain && audioCtx) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + fadeSeconds);
      setTimeout(() => {
        cleanupAudioSources();
      }, fadeSeconds * 1000);
      return;
    }
  } catch {
    // fallback immediate stop
  }
  cleanupAudioSources();
}

function cleanupAudioSources() {
  activeIntervals.forEach((id) => clearInterval(id));
  activeIntervals = [];

  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore
    }
  });
  activeOscillators = [];

  activeBufferSources.forEach((src) => {
    try {
      src.stop();
      src.disconnect();
    } catch {
      // ignore
    }
  });
  activeBufferSources = [];

  activeLFOs.forEach((lfo) => {
    try {
      lfo.stop();
      lfo.disconnect();
    } catch {
      // ignore
    }
  });
  activeLFOs = [];

  activeGainNodes.forEach((gain) => {
    try {
      gain.disconnect();
    } catch {
      // ignore
    }
  });
  activeGainNodes = [];

  if (importedAudioElement) {
    importedAudioElement.pause();
    importedAudioElement.currentTime = 0;
  }

  currentSyntheticPreset = null;
}

// Helper: generate looping buffer of noise
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown', durationSeconds = 5): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === 'brown') {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost gain
    }
  }
  return buffer;
}

// Procedural synthesizer implementations
export function playSyntheticPreset(preset: SyntheticPreset, fadeSeconds = 1) {
  cleanupAudioSources();
  const ctx = getAudioContext();
  currentSyntheticPreset = preset;

  const nodeGain = ctx.createGain();
  nodeGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  nodeGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + Math.max(0.2, fadeSeconds));
  nodeGain.connect(masterGain!);
  activeGainNodes.push(nodeGain);

  switch (preset) {
    case '40HZ_BINAURAL': {
      // Base carrier 200 Hz Left, 240 Hz Right (40 Hz differential binaural beat)
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, ctx.currentTime); // 40Hz difference

      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.4, ctx.currentTime);
      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.4, ctx.currentTime);

      oscLeft.connect(gainL);
      gainL.connect(merger, 0, 0);

      oscRight.connect(gainR);
      gainR.connect(merger, 0, 1);

      // Add gentle sub-bass anchor (100 Hz)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(100, ctx.currentTime);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.15, ctx.currentTime);
      subOsc.connect(subGain);
      subGain.connect(nodeGain);

      merger.connect(nodeGain);

      oscLeft.start();
      oscRight.start();
      subOsc.start();
      activeOscillators.push(oscLeft, oscRight, subOsc);
      break;
    }

    case 'LOW_FREQ_DRONE': {
      // 55 Hz (A1) deep harmonic drone
      const freqs = [55, 110, 164.81]; // Root, Octave, Fifth
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // micro detune for rich texture
        osc.detune.setValueAtTime(idx * 3 - 3, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.25 / (idx + 1), ctx.currentTime);

        osc.connect(filter);
        filter.connect(g);
        g.connect(nodeGain);
        osc.start();
        activeOscillators.push(osc);
      });
      break;
    }

    case 'BROWN_NOISE': {
      const noiseBuffer = createNoiseBuffer(ctx, 'brown', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, ctx.currentTime);

      noiseSrc.connect(lowpass);
      lowpass.connect(nodeGain);
      noiseSrc.start();
      activeBufferSources.push(noiseSrc);
      break;
    }

    case 'PINK_NOISE': {
      const noiseBuffer = createNoiseBuffer(ctx, 'pink', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(nodeGain);
      noiseSrc.start();
      activeBufferSources.push(noiseSrc);
      break;
    }

    case 'WHITE_NOISE': {
      const noiseBuffer = createNoiseBuffer(ctx, 'white', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);

      const gentleGain = ctx.createGain();
      gentleGain.gain.setValueAtTime(0.18, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(gentleGain);
      gentleGain.connect(nodeGain);
      noiseSrc.start();
      activeBufferSources.push(noiseSrc);
      break;
    }

    case 'RAIN':
    case 'HEAVY_RAIN':
    case 'LIGHT_RAIN': {
      // Layered pink/brown noise with bandpass shaping and raindrop impulses
      const rainBuffer = createNoiseBuffer(ctx, preset === 'HEAVY_RAIN' ? 'brown' : 'pink', 6);
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = rainBuffer;
      rainSrc.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(preset === 'LIGHT_RAIN' ? 2200 : preset === 'HEAVY_RAIN' ? 700 : 1200, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(preset === 'HEAVY_RAIN' ? 0.7 : 0.5, ctx.currentTime);

      rainSrc.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(nodeGain);
      rainSrc.start();
      activeBufferSources.push(rainSrc);

      // Raindrop impulse clicks
      const intervalId = window.setInterval(() => {
        try {
          const dropOsc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          dropOsc.type = 'sine';
          dropOsc.frequency.setValueAtTime(1400 + Math.random() * 1200, ctx.currentTime);
          dropGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          dropGain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.005);
          dropGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04);
          dropOsc.connect(dropGain);
          dropGain.connect(nodeGain);
          dropOsc.start();
          dropOsc.stop(ctx.currentTime + 0.05);
        } catch {
          // ignore
        }
      }, preset === 'HEAVY_RAIN' ? 120 : preset === 'LIGHT_RAIN' ? 350 : 200);

      activeIntervals.push(intervalId);
      break;
    }

    case 'OCEAN': {
      // Brown noise modulated with a rhythmic 0.08 Hz sine LFO (ocean swell)
      const noiseBuffer = createNoiseBuffer(ctx, 'brown', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const swellFilter = ctx.createBiquadFilter();
      swellFilter.type = 'lowpass';
      swellFilter.frequency.setValueAtTime(600, ctx.currentTime);

      const swellGain = ctx.createGain();
      swellGain.gain.setValueAtTime(0.3, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12-second wave period

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(swellGain.gain);

      noiseSrc.connect(swellFilter);
      swellFilter.connect(swellGain);
      swellGain.connect(nodeGain);

      noiseSrc.start();
      lfo.start();
      activeBufferSources.push(noiseSrc);
      activeLFOs.push(lfo);
      break;
    }

    case 'FOREST_WIND': {
      const noiseBuffer = createNoiseBuffer(ctx, 'pink', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      // Slowly modulate filter frequency
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSrc.connect(filter);
      filter.connect(nodeGain);

      noiseSrc.start();
      lfo.start();
      activeBufferSources.push(noiseSrc);
      activeLFOs.push(lfo);
      break;
    }

    case 'FIREPLACE': {
      const noiseBuffer = createNoiseBuffer(ctx, 'brown', 6);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(g);
      g.connect(nodeGain);
      noiseSrc.start();
      activeBufferSources.push(noiseSrc);

      // Wood crackle impulses
      const intervalId = window.setInterval(() => {
        if (Math.random() > 0.4) {
          try {
            const crackleOsc = ctx.createOscillator();
            const crackleGain = ctx.createGain();
            crackleOsc.type = 'sawtooth';
            crackleOsc.frequency.setValueAtTime(180 + Math.random() * 800, ctx.currentTime);
            crackleGain.gain.setValueAtTime(0.0001, ctx.currentTime);
            crackleGain.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.04, ctx.currentTime + 0.004);
            crackleGain.gain.linearRampToValueAtTime(0.00001, ctx.currentTime + 0.03);
            crackleOsc.connect(crackleGain);
            crackleGain.connect(nodeGain);
            crackleOsc.start();
            crackleOsc.stop(ctx.currentTime + 0.04);
          } catch {
            // ignore
          }
        }
      }, 150);

      activeIntervals.push(intervalId);
      break;
    }

    case 'CALM_DRONE': {
      // Warm chord: D3, A3, E4 (root, fifth, ninth)
      const chord = [146.83, 220.00, 329.63];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((idx - 1) * 2.5, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, ctx.currentTime);

        osc.connect(filter);
        filter.connect(g);
        g.connect(nodeGain);
        osc.start();
        activeOscillators.push(osc);
      });
      break;
    }
  }
}

// User-imported audio file playback
export function playImportedBlob(blob: Blob, fadeSeconds = 1, onEnded?: () => void) {
  cleanupAudioSources();
  const ctx = getAudioContext();

  if (!importedAudioElement) {
    importedAudioElement = new Audio();
    importedAudioElement.crossOrigin = 'anonymous';
    try {
      mediaElementSource = ctx.createMediaElementSource(importedAudioElement);
      mediaElementSource.connect(masterGain!);
    } catch {
      // Source already created or connected
    }
  }

  const url = URL.createObjectURL(blob);
  importedAudioElement.src = url;
  importedAudioElement.onended = () => {
    URL.revokeObjectURL(url);
    if (onEnded) onEnded();
  };

  if (masterGain) {
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + Math.max(0.2, fadeSeconds));
  }

  importedAudioElement.play().catch((err) => {
    console.warn('Playback error on imported audio:', err);
  });
}

export function pauseAudioPlayback() {
  if (importedAudioElement && !importedAudioElement.paused) {
    importedAudioElement.pause();
  }
  if (currentSyntheticPreset) {
    const saved = currentSyntheticPreset;
    cleanupAudioSources();
    currentSyntheticPreset = saved; // remember for resume
  }
}

export function resumeAudioPlayback() {
  if (importedAudioElement && importedAudioElement.paused && importedAudioElement.src) {
    importedAudioElement.play().catch(console.warn);
  } else if (currentSyntheticPreset) {
    playSyntheticPreset(currentSyntheticPreset, 0.5);
  }
}

export function isAudioCurrentlyPlaying(): boolean {
  if (importedAudioElement && !importedAudioElement.paused) return true;
  return activeBufferSources.length > 0 || activeOscillators.length > 0;
}

// Built-in Library Catalog (all 100% CC0 / Public Domain / procedural Web Audio synthesis)
export const BUILT_IN_TRACKS: AudioTrack[] = [
  {
    id: 'track_40hz',
    title: '40 Hz Gamma Focus Tone',
    subtitle: 'Binaural oscillation for intense cognitive processing',
    category: 'BINAURAL',
    type: 'SYNTHETIC',
    syntheticPreset: '40HZ_BINAURAL',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Procedurally generated mathematical tone.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_drone',
    title: 'Low-Frequency Sub Drone',
    subtitle: 'Warm 55 Hz A1 analog harmonic resonance',
    category: 'BINAURAL',
    type: 'SYNTHETIC',
    syntheticPreset: 'LOW_FREQ_DRONE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Algorithmic harmonic synthesis.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_brown',
    title: 'Brown Noise // Deep Rumble',
    subtitle: '6dB/octave integrated spectrum for deep work & ADHD',
    category: 'CONCENTRATION',
    type: 'SYNTHETIC',
    syntheticPreset: 'BROWN_NOISE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Mathematical brownian noise algorithm.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_pink',
    title: 'Pink Noise // Smooth Equilibrium',
    subtitle: '1/f natural acoustic frequency distribution',
    category: 'CONCENTRATION',
    type: 'SYNTHETIC',
    syntheticPreset: 'PINK_NOISE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Algorithmic cascaded pole synthesis.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_white',
    title: 'White Noise // Static Shield',
    subtitle: 'Flat spectral density masking background speech',
    category: 'CONCENTRATION',
    type: 'SYNTHETIC',
    syntheticPreset: 'WHITE_NOISE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Pure mathematical random distribution.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_rain',
    title: 'Rain Study // Window Downpour',
    subtitle: 'Dynamic bandpass resonance with raindrop impulses',
    category: 'NATURE',
    type: 'SYNTHETIC',
    syntheticPreset: 'RAIN',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Algorithmic acoustic simulation.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_heavy_rain',
    title: 'Heavy Rain // Distant Thunder',
    subtitle: 'Low-frequency resonant deluge for solitary focus',
    category: 'NATURE',
    type: 'SYNTHETIC',
    syntheticPreset: 'HEAVY_RAIN',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Algorithmic storm simulation.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_ocean',
    title: 'Ocean Swell // Deep Shore',
    subtitle: 'Rhythmic 0.08 Hz periodic ebb and flow',
    category: 'NATURE',
    type: 'SYNTHETIC',
    syntheticPreset: 'OCEAN',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Low-frequency oscillation wave synthesis.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_wind',
    title: 'Forest Wind // Autumn Ridge',
    subtitle: 'Sweeping bandpass breeze across pine needles',
    category: 'NATURE',
    type: 'SYNTHETIC',
    syntheticPreset: 'FOREST_WIND',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Filter-swept noise algorithm.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_fireplace',
    title: 'Cedar Fireplace // Hearth',
    subtitle: 'Low-pass hearth warmth with randomized embers',
    category: 'NATURE',
    type: 'SYNTHETIC',
    syntheticPreset: 'FIREPLACE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Granular ember crackle synthesis.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'track_calm',
    title: 'White Room Calm // Harmonic Pad',
    subtitle: 'Soft D-major ninth ambient atmosphere',
    category: 'CALM',
    type: 'SYNTHETIC',
    syntheticPreset: 'CALM_DRONE',
    license: 'CC0 / Public Domain',
    source: 'Procedural Web Audio Engine',
    attributionRequirement: 'None. Pure mathematical triad pads.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const DEFAULT_PLAYLISTS: AudioPlaylist[] = [
  {
    id: 'pl_whiteroom',
    name: 'WHITE ROOM',
    description: 'Sterile, zero-emotion concentration atmosphere',
    trackIds: ['track_brown', 'track_40hz', 'track_calm'],
    playbackMode: 'LOOP_PLAYLIST',
    fadeDuration: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pl_rainstudy',
    name: 'RAIN STUDY',
    description: 'Relentless atmospheric rain for solitary problem solving',
    trackIds: ['track_rain', 'track_heavy_rain'],
    playbackMode: 'LOOP_PLAYLIST',
    fadeDuration: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pl_nightcoding',
    name: 'NIGHT CODING',
    description: 'Low-frequency sub drones and binaural concentration',
    trackIds: ['track_drone', 'track_brown', 'track_40hz'],
    playbackMode: 'LOOP_PLAYLIST',
    fadeDuration: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pl_deepfocus',
    name: 'DEEP FOCUS',
    description: 'Continuous brown noise shielding against distraction',
    trackIds: ['track_brown'],
    playbackMode: 'LOOP_TRACK',
    fadeDuration: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];
