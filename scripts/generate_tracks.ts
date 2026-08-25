import * as fs from 'fs';
import * as path from 'path';

// Helper to write a 16-bit 44100Hz Stereo WAV file
function writeWavFile(filePath: string, sampleRate: number, leftChannel: Float32Array, rightChannel: Float32Array) {
  const numSamples = leftChannel.length;
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, leftChannel[i]));
    let valL = sL < 0 ? sL * 32768 : sL * 32767;
    buffer.writeInt16LE(Math.floor(valL), offset);
    offset += 2;

    // Right channel
    let sR = Math.max(-1, Math.min(1, rightChannel[i]));
    let valR = sR < 0 ? sR * 32768 : sR * 32767;
    buffer.writeInt16LE(Math.floor(valR), offset);
    offset += 2;
  }

  fs.writeFileSync(filePath, buffer);
  console.log(`Generated WAV: ${filePath} (${(dataSize / 1024 / 1024).toFixed(2)} MB, ${(numSamples / sampleRate).toFixed(1)}s)`);
}

const SAMPLE_RATE = 44100;

// Note frequencies map
const NOTE_FREQS: Record<string, number> = {
  'C1': 32.70, 'D1': 36.71, 'Eb1': 38.89, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'Ab1': 51.91, 'A1': 55.00, 'Bb1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'Db2': 69.30, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Gb4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'Db5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'Gb5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00
};

// Instrument synthesizer helpers
class AudioRenderer {
  left: Float32Array;
  right: Float32Array;
  numSamples: number;
  sampleRate: number;

  constructor(durationSeconds: number, sampleRate: number = SAMPLE_RATE) {
    this.sampleRate = sampleRate;
    this.numSamples = Math.floor(durationSeconds * sampleRate);
    this.left = new Float32Array(this.numSamples);
    this.right = new Float32Array(this.numSamples);
  }

  // Add a kick drum at a specific time
  addKick(timeSec: number, volume: number = 0.8) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const durSec = 0.35;
    const count = Math.min(this.numSamples - startIdx, Math.floor(durSec * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      // Exponential pitch drop from 160Hz down to 42Hz
      const pitch = 42 + 120 * Math.exp(-t * 30);
      const phase = 2 * Math.PI * (42 * t + (120 / 30) * (1 - Math.exp(-t * 30)));
      const amp = Math.exp(-t * 9) * volume;
      // Click at start
      const click = i < 150 ? (Math.random() * 2 - 1) * 0.4 * (1 - i / 150) : 0;
      const s = (Math.sin(phase) + click) * amp;
      this.left[startIdx + i] += s * 0.9;
      this.right[startIdx + i] += s * 0.9;
    }
  }

  // Add a snare drum
  addSnare(timeSec: number, volume: number = 0.6) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const durSec = 0.28;
    const count = Math.min(this.numSamples - startIdx, Math.floor(durSec * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      const body = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 14);
      const s = (body * 0.5 + noise * 0.7) * volume;
      this.left[startIdx + i] += s * 0.9;
      this.right[startIdx + i] += s * 0.9;
    }
  }

  // Add hihat
  addHiHat(timeSec: number, open: boolean = false, volume: number = 0.35) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const durSec = open ? 0.35 : 0.06;
    const count = Math.min(this.numSamples - startIdx, Math.floor(durSec * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    const decay = open ? 9 : 45;
    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      // High pass noise
      const noise = (Math.random() * 2 - 1);
      const s = noise * Math.exp(-t * decay) * volume;
      this.left[startIdx + i] += s * 0.7;
      this.right[startIdx + i] += s * 0.85;
    }
  }

  // Add hand clap
  addClap(timeSec: number, volume: number = 0.5) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const durSec = 0.25;
    const count = Math.min(this.numSamples - startIdx, Math.floor(durSec * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      // 3 initial mini-bursts then decay
      let pulse = 0;
      if (t < 0.01) pulse = 1;
      else if (t >= 0.012 && t < 0.022) pulse = 0.9;
      else if (t >= 0.024) pulse = Math.exp(-(t - 0.024) * 18);

      const noise = (Math.random() * 2 - 1) * pulse * volume;
      this.left[startIdx + i] += noise * 0.85;
      this.right[startIdx + i] += noise * 0.85;
    }
  }

  // Add conga / bongo
  addConga(timeSec: number, high: boolean = false, volume: number = 0.5) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const durSec = 0.2;
    const count = Math.min(this.numSamples - startIdx, Math.floor(durSec * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    const freq = high ? 360 : 210;
    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      const pitch = freq * (1 + 0.3 * Math.exp(-t * 40));
      const s = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 16) * volume;
      this.left[startIdx + i] += s * (high ? 0.7 : 0.9);
      this.right[startIdx + i] += s * (high ? 0.9 : 0.7);
    }
  }

  // Add note with rich synthesizer sound
  addNote(
    type: 'piano' | 'guitar_clean' | 'guitar_dist' | 'synth_lead' | 'synth_bass' | 'sub_bass' | 'brass_stab' | 'organ',
    freq: number,
    timeSec: number,
    durSec: number,
    volume: number = 0.4,
    pan: number = 0 // -1 (left) to 1 (right)
  ) {
    const startIdx = Math.floor(timeSec * this.sampleRate);
    const count = Math.min(this.numSamples - startIdx, Math.floor((durSec + 0.15) * this.sampleRate));
    if (startIdx < 0 || count <= 0) return;

    const panL = Math.cos((pan + 1) * 0.25 * Math.PI);
    const panR = Math.sin((pan + 1) * 0.25 * Math.PI);

    for (let i = 0; i < count; i++) {
      const t = i / this.sampleRate;
      let s = 0;

      if (type === 'piano') {
        // Multi-harmonic rich acoustic piano tone
        const env = Math.exp(-t * (4 / Math.max(0.2, durSec)));
        const h1 = Math.sin(2 * Math.PI * freq * t);
        const h2 = 0.5 * Math.sin(2 * Math.PI * freq * 2 * t);
        const h3 = 0.25 * Math.sin(2 * Math.PI * freq * 3 * t);
        const h4 = 0.12 * Math.sin(2 * Math.PI * freq * 4 * t);
        const attack = t < 0.006 ? t / 0.006 : 1;
        s = (h1 + h2 + h3 + h4) * env * attack * volume;
      } else if (type === 'guitar_clean') {
        // Stratocaster arpeggio pluck with subtle vibrato
        const env = Math.exp(-t * 3.5);
        const vibrato = Math.sin(2 * Math.PI * 5.5 * t) * 1.5;
        const h1 = Math.sin(2 * Math.PI * (freq + vibrato) * t);
        const h2 = 0.4 * Math.sin(2 * Math.PI * (freq * 2) * t);
        const h3 = 0.2 * Math.sin(2 * Math.PI * (freq * 3) * t);
        const pluck = t < 0.008 ? Math.sin(Math.PI * t / 0.008) : 1;
        s = (h1 + h2 + h3) * env * pluck * volume;
      } else if (type === 'guitar_dist') {
        // Overdriven power chord guitar
        const env = Math.exp(-t * 2.0);
        let raw = Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 1.5 * t);
        // Soft clipping distortion
        raw = Math.tanh(raw * 3.5);
        s = raw * env * volume;
      } else if (type === 'synth_lead') {
        // SuperSaw / Eurodance synth with detune & chorus
        const env = Math.exp(-t * 2.2);
        const f1 = freq;
        const f2 = freq * 1.006;
        const f3 = freq * 0.994;
        const saw1 = 2 * ((f1 * t) % 1) - 1;
        const saw2 = 2 * ((f2 * t) % 1) - 1;
        const saw3 = 2 * ((f3 * t) % 1) - 1;
        const filter = Math.exp(-t * 1.5);
        s = (saw1 + saw2 * 0.8 + saw3 * 0.8) * 0.4 * env * (0.6 + 0.4 * filter) * volume;
      } else if (type === 'synth_bass') {
        // Punchy electro house synth bass
        const env = Math.exp(-t * 4.5);
        const saw = 2 * ((freq * t) % 1) - 1;
        const sub = Math.sin(2 * Math.PI * freq * 0.5 * t);
        s = (saw * 0.6 + sub * 0.8) * env * volume;
      } else if (type === 'sub_bass') {
        // Clean sub bass
        const env = Math.exp(-t * 2.5);
        const s1 = Math.sin(2 * Math.PI * freq * t);
        const s2 = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
        s = (s1 + s2) * env * volume;
      } else if (type === 'brass_stab') {
        // Alors on danse / 90s House brass stab
        const env = Math.exp(-t * 3.0);
        const saw1 = 2 * ((freq * t) % 1) - 1;
        const saw2 = 2 * (((freq * 1.008) * t) % 1) - 1;
        const square = Math.sign(Math.sin(2 * Math.PI * freq * t));
        const raw = (saw1 * 0.5 + saw2 * 0.4 + square * 0.3);
        const filterEnv = Math.exp(-t * 5.0);
        s = raw * env * (0.4 + 0.6 * filterEnv) * volume;
      } else if (type === 'organ') {
        // Latin rock organ
        const env = Math.exp(-t * 2.0);
        const s1 = Math.sin(2 * Math.PI * freq * t);
        const s2 = 0.6 * Math.sin(2 * Math.PI * freq * 2 * t);
        const s3 = 0.4 * Math.sin(2 * Math.PI * freq * 3 * t);
        const s4 = 0.3 * Math.sin(2 * Math.PI * freq * 4 * t);
        s = (s1 + s2 + s3 + s4) * 0.4 * env * volume;
      }

      this.left[startIdx + i] += s * panL;
      this.right[startIdx + i] += s * panR;
    }
  }

  // Master Limiter & Normalize to prevent clipping
  normalizeAndFinalize(targetPeak: number = 0.95) {
    let maxPeak = 0.0001;
    for (let i = 0; i < this.numSamples; i++) {
      const aL = Math.abs(this.left[i]);
      const aR = Math.abs(this.right[i]);
      if (aL > maxPeak) maxPeak = aL;
      if (aR > maxPeak) maxPeak = aR;
    }

    const gain = targetPeak / maxPeak;
    for (let i = 0; i < this.numSamples; i++) {
      // Soft saturation limiter
      this.left[i] = Math.tanh(this.left[i] * gain);
      this.right[i] = Math.tanh(this.right[i] * gain);
    }
  }
}

// ----------------------------------------------------
// 1. LINKIN PARK - IN THE END (Full Arrangement ~45s looping)
// ----------------------------------------------------
function generateInTheEnd(): AudioRenderer {
  const bpm = 105;
  const beatSec = 60 / bpm;
  const numBars = 20; // ~45 seconds
  const totalDuration = numBars * 4 * beatSec;
  const r = new AudioRenderer(totalDuration);

  // In the End iconic piano motif notes:
  // Eb4, Bb4, Bb4, Ab4, Ab4, Ab4, G4, Bb4
  const pianoRiff = [
    { n: 'Eb4', d: 0.5 }, { n: 'Bb4', d: 0.5 }, { n: 'Bb4', d: 0.5 }, { n: 'Ab4', d: 0.5 },
    { n: 'Ab4', d: 0.5 }, { n: 'Ab4', d: 0.5 }, { n: 'G4', d: 0.5 }, { n: 'Bb4', d: 0.5 }
  ];

  // Chords: Eb Minor -> Db Major -> B Major -> Db Major
  const bassChords = [
    { bass: 'Eb2', root: 'Eb4', len: 4 },
    { bass: 'Db2', root: 'Db4', len: 4 },
    { bass: 'B1', root: 'B3', len: 4 },
    { bass: 'Db2', root: 'Db4', len: 4 }
  ];

  let curTime = 0;
  for (let bar = 0; bar < numBars; bar++) {
    const chord = bassChords[bar % bassChords.length];

    // Drums (Start after bar 4 for build-up)
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = curTime + beat * beatSec;
      // Kick on 1 and 3 (and syncopation on bar >= 8)
      if (bar >= 2) {
        if (beat === 0 || beat === 2.5) r.addKick(beatTime, 0.9);
        if (beat === 1 || beat === 3) r.addSnare(beatTime, 0.75);
        r.addHiHat(beatTime, false, 0.35);
        r.addHiHat(beatTime + beatSec * 0.5, false, 0.25);
      }
    }

    // Heavy Nu-Metal Bass
    if (bar >= 2) {
      r.addNote('synth_bass', NOTE_FREQS[chord.bass], curTime, beatSec * 1.8, 0.6, 0);
      r.addNote('synth_bass', NOTE_FREQS[chord.bass], curTime + beatSec * 2, beatSec * 1.8, 0.6, 0);
    }

    // Distorted Guitar Power Chords in Chorus (bar >= 10)
    if (bar >= 10) {
      r.addNote('guitar_dist', NOTE_FREQS[chord.bass] * 2, curTime, beatSec * 3.8, 0.45, -0.6);
      r.addNote('guitar_dist', NOTE_FREQS[chord.bass] * 2, curTime, beatSec * 3.8, 0.45, 0.6);
    }

    // Piano Motif
    for (let p = 0; p < pianoRiff.length; p++) {
      const pNote = pianoRiff[p];
      const noteTime = curTime + (p * 0.5) * beatSec;
      r.addNote('piano', NOTE_FREQS[pNote.n], noteTime, beatSec * 0.7, 0.55, -0.2);
    }

    curTime += 4 * beatSec;
  }

  r.normalizeAndFinalize();
  return r;
}

// ----------------------------------------------------
// 2. RED HOT CHILI PEPPERS - CALIFORNICATION (~45s)
// ----------------------------------------------------
function generateCalifornication(): AudioRenderer {
  const bpm = 96;
  const beatSec = 60 / bpm;
  const numBars = 18; // ~45 seconds
  const totalDuration = numBars * 4 * beatSec;
  const r = new AudioRenderer(totalDuration);

  // Arpeggio: Am -> F -> C -> G
  const arpeggios = [
    // Am
    { bass: 'A1', notes: ['A3', 'E4', 'A4', 'C5', 'G4', 'E4'], dur: 2 },
    // F
    { bass: 'F1', notes: ['F3', 'C4', 'F4', 'A4', 'E4', 'C4'], dur: 2 },
    // C
    { bass: 'C2', notes: ['C3', 'G3', 'C4', 'E4', 'D4', 'C4'], dur: 2 },
    // G
    { bass: 'G1', notes: ['G3', 'D4', 'G4', 'B4', 'A4', 'G4'], dur: 2 }
  ];

  let curTime = 0;
  for (let bar = 0; bar < numBars; bar += 2) {
    for (let arp of arpeggios) {
      // Bassline (Flea)
      r.addNote('sub_bass', NOTE_FREQS[arp.bass], curTime, beatSec * 1.6, 0.65, 0);
      r.addNote('sub_bass', NOTE_FREQS[arp.bass] * 2, curTime + beatSec * 1.2, beatSec * 0.6, 0.45, 0);

      // Clean Stratocaster Guitar Arpeggio (John Frusciante)
      for (let i = 0; i < arp.notes.length; i++) {
        const noteTime = curTime + i * (beatSec * 0.33);
        r.addNote('guitar_clean', NOTE_FREQS[arp.notes[i]], noteTime, beatSec * 0.8, 0.5, 0.3);
      }

      // Drums
      if (bar >= 2) {
        r.addKick(curTime, 0.8);
        r.addKick(curTime + beatSec * 1.5, 0.7);
        r.addSnare(curTime + beatSec * 1, 0.65);
        r.addHiHat(curTime, false, 0.3);
        r.addHiHat(curTime + beatSec * 0.5, false, 0.3);
        r.addHiHat(curTime + beatSec * 1.0, false, 0.3);
        r.addHiHat(curTime + beatSec * 1.5, true, 0.35);
      }

      curTime += arp.dur * beatSec;
    }
  }

  r.normalizeAndFinalize();
  return r;
}

// ----------------------------------------------------
// 3. ATC - AROUND THE WORLD (LA LA LA) (~45s)
// ----------------------------------------------------
function generateAroundTheWorld(): AudioRenderer {
  const bpm = 132;
  const beatSec = 60 / bpm;
  const numBars = 24; // ~44 seconds
  const totalDuration = numBars * 4 * beatSec;
  const r = new AudioRenderer(totalDuration);

  // Hook: A4, B4, C5, D5, E5, D5, C5, B4, A4
  const leadHook = [
    { n: 'A4', d: 0.5 }, { n: 'B4', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'D5', d: 0.5 },
    { n: 'E5', d: 0.75 }, { n: 'D5', d: 0.5 }, { n: 'C5', d: 0.5 }, { n: 'B4', d: 0.75 },
    { n: 'A4', d: 1.0 }
  ];

  const chords = ['A2', 'F2', 'C2', 'G2'];

  let curTime = 0;
  for (let bar = 0; bar < numBars; bar++) {
    const bassNote = chords[bar % chords.length];

    // Eurodance Four-on-the-floor Kick
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = curTime + beat * beatSec;
      r.addKick(beatTime, 0.95);
      // Offbeat open hi-hat (classic 2000 eurodance)
      r.addHiHat(beatTime + beatSec * 0.5, true, 0.45);
      // Snare / Clap on 2 & 4
      if (beat === 1 || beat === 3) {
        r.addSnare(beatTime, 0.7);
        r.addClap(beatTime, 0.6);
      }
    }

    // Pumping Euro Synth Bass
    for (let sixteenth = 0; sixteenth < 8; sixteenth++) {
      const bassTime = curTime + sixteenth * (beatSec * 0.5);
      r.addNote('synth_bass', NOTE_FREQS[bassNote], bassTime, beatSec * 0.35, 0.55, 0);
    }

    // Lead Hook SuperSaw Synth (La La La La La)
    for (let l = 0; l < leadHook.length; l++) {
      const note = leadHook[l];
      const noteTime = curTime + l * (beatSec * 0.42);
      r.addNote('synth_lead', NOTE_FREQS[note.n], noteTime, beatSec * note.d, 0.6, -0.2);
      r.addNote('synth_lead', NOTE_FREQS[note.n] * 0.5, noteTime, beatSec * note.d, 0.3, 0.2);
    }

    curTime += 4 * beatSec;
  }

  r.normalizeAndFinalize();
  return r;
}

// ----------------------------------------------------
// 4. STROMAE - ALORS ON DANSE (~45s)
// ----------------------------------------------------
function generateAlorsOnDanse(): AudioRenderer {
  const bpm = 120;
  const beatSec = 60 / bpm;
  const numBars = 22; // ~44 seconds
  const totalDuration = numBars * 4 * beatSec;
  const r = new AudioRenderer(totalDuration);

  // Iconic Brass Stab Melody: D4, E4, F4, E4, D4, C4, D4, B3, D4
  const brassRiff = [
    { n: 'D4', d: 0.35 }, { n: 'E4', d: 0.35 }, { n: 'F4', d: 0.4 }, { n: 'E4', d: 0.35 },
    { n: 'D4', d: 0.35 }, { n: 'C4', d: 0.35 }, { n: 'D4', d: 0.5 }, { n: 'B3', d: 0.35 },
    { n: 'D4', d: 0.45 }
  ];

  let curTime = 0;
  for (let bar = 0; bar < numBars; bar++) {
    // 4-on-the-floor electro club beat
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = curTime + beat * beatSec;
      r.addKick(beatTime, 0.95);
      if (beat === 1 || beat === 3) {
        r.addClap(beatTime, 0.75);
      }
      r.addHiHat(beatTime + beatSec * 0.5, false, 0.35);
    }

    // Heavy Electro Bassline
    r.addNote('synth_bass', NOTE_FREQS['D2'], curTime, beatSec * 1.5, 0.65, 0);
    r.addNote('synth_bass', NOTE_FREQS['F2'], curTime + beatSec * 1.5, beatSec * 1.0, 0.65, 0);
    r.addNote('synth_bass', NOTE_FREQS['C2'], curTime + beatSec * 2.5, beatSec * 1.5, 0.65, 0);

    // Brass Lead Stabs
    for (let b = 0; b < brassRiff.length; b++) {
      const item = brassRiff[b];
      const noteTime = curTime + b * (beatSec * 0.42);
      r.addNote('brass_stab', NOTE_FREQS[item.n], noteTime, beatSec * item.d, 0.65, 0.1);
      r.addNote('brass_stab', NOTE_FREQS[item.n] * 0.5, noteTime, beatSec * item.d, 0.4, -0.1);
    }

    curTime += 4 * beatSec;
  }

  r.normalizeAndFinalize();
  return r;
}

// ----------------------------------------------------
// 5. SANTANA FT. ROB THOMAS - SMOOTH (~45s)
// ----------------------------------------------------
function generateSmooth(): AudioRenderer {
  const bpm = 116;
  const beatSec = 60 / bpm;
  const numBars = 22; // ~45 seconds
  const totalDuration = numBars * 4 * beatSec;
  const r = new AudioRenderer(totalDuration);

  // Carlos Santana Guitar Lead Riff: E5, G5, A5, C6, B5, A5, G5, E5, D5, E5
  const guitarRiff = [
    { n: 'E5', d: 0.35 }, { n: 'G5', d: 0.35 }, { n: 'A5', d: 0.6 },
    { n: 'C6', d: 0.35 }, { n: 'B5', d: 0.35 }, { n: 'A5', d: 0.45 },
    { n: 'G5', d: 0.35 }, { n: 'E5', d: 0.45 }, { n: 'D5', d: 0.35 },
    { n: 'E5', d: 0.8 }
  ];

  let curTime = 0;
  for (let bar = 0; bar < numBars; bar++) {
    // Latin Rock Percussion
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = curTime + beat * beatSec;
      r.addKick(beatTime, 0.85);
      if (beat === 1 || beat === 3) {
        r.addSnare(beatTime, 0.7);
      }
      r.addHiHat(beatTime, false, 0.25);
      r.addHiHat(beatTime + beatSec * 0.5, true, 0.3);
    }

    // Congas & Bongos
    r.addConga(curTime + beatSec * 0.25, false, 0.55);
    r.addConga(curTime + beatSec * 0.75, true, 0.6);
    r.addConga(curTime + beatSec * 2.25, false, 0.55);
    r.addConga(curTime + beatSec * 2.75, true, 0.6);

    // Latin Bassline (Am - D - F - E)
    const rootBass = bar % 4 === 0 ? 'A1' : bar % 4 === 1 ? 'D2' : bar % 4 === 2 ? 'F1' : 'E1';
    r.addNote('sub_bass', NOTE_FREQS[rootBass], curTime, beatSec * 1.5, 0.65, 0);
    r.addNote('sub_bass', NOTE_FREQS[rootBass] * 1.5, curTime + beatSec * 1.5, beatSec * 1.0, 0.5, 0);
    r.addNote('sub_bass', NOTE_FREQS[rootBass], curTime + beatSec * 2.5, beatSec * 1.5, 0.65, 0);

    // Organ chords
    r.addNote('organ', NOTE_FREQS['A3'], curTime, beatSec * 3.5, 0.35, -0.4);
    r.addNote('organ', NOTE_FREQS['C4'], curTime, beatSec * 3.5, 0.35, -0.4);
    r.addNote('organ', NOTE_FREQS['E4'], curTime, beatSec * 3.5, 0.35, -0.4);

    // Carlos Santana Lead Guitar Solo & Melodies
    for (let g = 0; g < guitarRiff.length; g++) {
      const note = guitarRiff[g];
      const noteTime = curTime + g * (beatSec * 0.38);
      r.addNote('guitar_clean', NOTE_FREQS[note.n], noteTime, beatSec * note.d, 0.65, 0.25);
    }

    curTime += 4 * beatSec;
  }

  r.normalizeAndFinalize();
  return r;
}

// ----------------------------------------------------
// Main Build Execution
// ----------------------------------------------------
const publicAudioDir = path.join(process.cwd(), 'public', 'audio');
if (!fs.existsSync(publicAudioDir)) {
  fs.mkdirSync(publicAudioDir, { recursive: true });
}

console.log('Generating audio tracks in public/audio/...');

const t1 = generateInTheEnd();
writeWavFile(path.join(publicAudioDir, 'in_the_end.wav'), SAMPLE_RATE, t1.left, t1.right);

const t2 = generateCalifornication();
writeWavFile(path.join(publicAudioDir, 'californication.wav'), SAMPLE_RATE, t2.left, t2.right);

const t3 = generateAroundTheWorld();
writeWavFile(path.join(publicAudioDir, 'around_the_world.wav'), SAMPLE_RATE, t3.left, t3.right);

const t4 = generateAlorsOnDanse();
writeWavFile(path.join(publicAudioDir, 'alors_on_danse.wav'), SAMPLE_RATE, t4.left, t4.right);

const t5 = generateSmooth();
writeWavFile(path.join(publicAudioDir, 'smooth.wav'), SAMPLE_RATE, t5.left, t5.right);

console.log('All 5 audio tracks successfully created and ready in public/audio!');
