import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  Radio,
  Sparkles,
  ListMusic,
  Upload,
  FileAudio,
  CheckCircle2,
  Trash2,
  FolderOpen,
  Download,
  Search,
  HardDrive,
  Heart
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  bitrate: string;
  genre: string;
  isFlagshipSaved?: boolean;
  audioUrl?: string;
  melodyNotes: { freq: number; dur: number; bassFreq?: number }[];
  bpm: number;
}

// Simple IndexedDB storage for offline/persistent custom MP3 files
const DB_NAME = 'napster_audio_db';
const STORE_NAME = 'audio_tracks';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveCustomTrackAudio(trackId: number, file: Blob, fileName: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob: file, fileName, timestamp: Date.now() }, trackId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB', err);
  }
}

async function getCustomTrackAudio(trackId: number): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function deleteCustomTrackAudio(trackId: number): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(trackId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete from IndexedDB', err);
  }
}

export const NapsterApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(4); // Default to Track 5 (Smooth - Santana)
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [eqBars, setEqBars] = useState<number[]>([20, 45, 70, 85, 95, 75, 50, 30]);
  const [customAudios, setCustomAudios] = useState<Record<number, { url: string; fileName: string; duration?: number }>>({});
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [targetUploadTrackId, setTargetUploadTrackId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'all'>('library');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // In the End iconic piano intro motif: Eb4 - Bb4 - Bb4 - Ab4 - Ab4 - Ab4 - G4 - Bb4
  const inTheEndMelody = [
    { freq: 311.13, dur: 0.45, bassFreq: 77.78 }, // Eb4 / Eb2
    { freq: 466.16, dur: 0.45, bassFreq: 77.78 }, // Bb4
    { freq: 466.16, dur: 0.45, bassFreq: 77.78 }, // Bb4
    { freq: 415.30, dur: 0.45, bassFreq: 69.30 }, // Ab4 / Db2
    { freq: 415.30, dur: 0.45, bassFreq: 69.30 }, // Ab4
    { freq: 415.30, dur: 0.45, bassFreq: 69.30 }, // Ab4
    { freq: 392.00, dur: 0.45, bassFreq: 65.41 }, // G4 / C2
    { freq: 466.16, dur: 0.45, bassFreq: 77.78 }  // Bb4 / Eb2
  ];

  // Californication iconic guitar intro arpeggio: Am -> F -> C -> G
  const californicationMelody = [
    { freq: 220.00, dur: 0.35, bassFreq: 110.00 }, // A3
    { freq: 329.63, dur: 0.35, bassFreq: 110.00 }, // E4
    { freq: 440.00, dur: 0.35, bassFreq: 110.00 }, // A4
    { freq: 523.25, dur: 0.35, bassFreq: 110.00 }, // C5
    { freq: 392.00, dur: 0.35, bassFreq: 110.00 }, // G4
    { freq: 329.63, dur: 0.35, bassFreq: 110.00 }, // E4
    { freq: 174.61, dur: 0.35, bassFreq: 87.31 },  // F3
    { freq: 261.63, dur: 0.35, bassFreq: 87.31 },  // C4
    { freq: 349.23, dur: 0.35, bassFreq: 87.31 },  // F4
    { freq: 440.00, dur: 0.35, bassFreq: 87.31 },  // A4
    { freq: 130.81, dur: 0.35, bassFreq: 65.41 },  // C3
    { freq: 196.00, dur: 0.35, bassFreq: 65.41 },  // G3
    { freq: 261.63, dur: 0.35, bassFreq: 65.41 },  // C4
    { freq: 329.63, dur: 0.35, bassFreq: 65.41 },  // E4
    { freq: 196.00, dur: 0.35, bassFreq: 98.00 },  // G3
    { freq: 293.66, dur: 0.35, bassFreq: 98.00 },  // D4
    { freq: 392.00, dur: 0.35, bassFreq: 98.00 },  // G4
    { freq: 493.88, dur: 0.35, bassFreq: 98.00 }   // B4
  ];

  // ATC - Around the World iconic synth hook (La la la la la)
  const aroundTheWorldMelody = [
    { freq: 440.00, dur: 0.28, bassFreq: 110.00 }, // A4
    { freq: 493.88, dur: 0.28, bassFreq: 110.00 }, // B4
    { freq: 523.25, dur: 0.28, bassFreq: 130.81 }, // C5
    { freq: 587.33, dur: 0.28, bassFreq: 146.83 }, // D5
    { freq: 659.25, dur: 0.35, bassFreq: 164.81 }, // E5
    { freq: 587.33, dur: 0.28, bassFreq: 146.83 }, // D5
    { freq: 523.25, dur: 0.28, bassFreq: 130.81 }, // C5
    { freq: 493.88, dur: 0.35, bassFreq: 110.00 }, // B4
    { freq: 440.00, dur: 0.45, bassFreq: 110.00 }  // A4
  ];

  // Stromae - Alors on danse iconic brass/synth hook
  const alorsOnDanseMelody = [
    { freq: 293.66, dur: 0.35, bassFreq: 73.42 }, // D4 / D2
    { freq: 329.63, dur: 0.35, bassFreq: 73.42 }, // E4
    { freq: 349.23, dur: 0.35, bassFreq: 87.31 }, // F4 / F2
    { freq: 329.63, dur: 0.35, bassFreq: 73.42 }, // E4
    { freq: 293.66, dur: 0.35, bassFreq: 73.42 }, // D4
    { freq: 261.63, dur: 0.35, bassFreq: 65.41 }, // C4 / C2
    { freq: 293.66, dur: 0.45, bassFreq: 73.42 }, // D4 / D2
    { freq: 246.94, dur: 0.35, bassFreq: 61.74 }, // B3 / B1
    { freq: 293.66, dur: 0.35, bassFreq: 73.42 }  // D4 / D2
  ];

  // Santana ft. Rob Thomas - Smooth iconic guitar intro & latin brass hook
  const smoothMelody = [
    { freq: 659.25, dur: 0.28, bassFreq: 110.00 }, // E5 / A2
    { freq: 783.99, dur: 0.28, bassFreq: 110.00 }, // G5
    { freq: 880.00, dur: 0.42, bassFreq: 110.00 }, // A5
    { freq: 1046.50, dur: 0.28, bassFreq: 146.83 }, // C6 / D3
    { freq: 987.77, dur: 0.28, bassFreq: 146.83 }, // B5
    { freq: 880.00, dur: 0.35, bassFreq: 146.83 }, // A5
    { freq: 783.99, dur: 0.28, bassFreq: 164.81 }, // G5 / E3
    { freq: 659.25, dur: 0.35, bassFreq: 164.81 }, // E5
    { freq: 587.33, dur: 0.28, bassFreq: 196.00 }, // D5 / G3
    { freq: 659.25, dur: 0.45, bassFreq: 110.00 }  // E5 / A2
  ];

  const basePlaylist: Track[] = [
    {
      id: 1,
      title: 'In the End (Retro Synthwave Edition)',
      artist: 'Linkin Park',
      album: 'Hybrid Theory (2000)',
      duration: 218, // 3:38
      bitrate: '320 kbps (High Quality)',
      genre: 'Nu-Metal / Alternative',
      isFlagshipSaved: true,
      audioUrl: '/audio/in_the_end.wav',
      melodyNotes: inTheEndMelody,
      bpm: 105
    },
    {
      id: 2,
      title: 'Californication (Early 2000s Mix)',
      artist: 'Red Hot Chili Peppers',
      album: 'Californication (1999/2000)',
      duration: 321, // 5:21
      bitrate: '320 kbps (High Quality)',
      genre: 'Alternative Rock',
      isFlagshipSaved: true,
      audioUrl: '/audio/californication.wav',
      melodyNotes: californicationMelody,
      bpm: 96
    },
    {
      id: 3,
      title: 'Around the World (La La La)',
      artist: 'ATC',
      album: 'Planet Pop (2000)',
      duration: 215, // 3:35
      bitrate: '320 kbps (High Quality)',
      genre: 'Eurodance 2000',
      isFlagshipSaved: true,
      audioUrl: '/audio/around_the_world.wav',
      melodyNotes: aroundTheWorldMelody,
      bpm: 132
    },
    {
      id: 4,
      title: 'Alors on danse (French Electro-House Mix)',
      artist: 'Stromae / Jamel Tribute',
      album: 'Cheese (Euro Club Classics)',
      duration: 206, // 3:26
      bitrate: '320 kbps (High Quality)',
      genre: 'Euro Dance / Electro House',
      isFlagshipSaved: true,
      audioUrl: '/audio/alors_on_danse.wav',
      melodyNotes: alorsOnDanseMelody,
      bpm: 120
    },
    {
      id: 5,
      title: 'Smooth (Early 2000s Latin Hit)',
      artist: 'Santana ft. Rob Thomas',
      album: 'Supernatural (1999/2000)',
      duration: 298, // 4:58
      bitrate: '320 kbps (High Quality)',
      genre: 'Latin Rock / Pop',
      isFlagshipSaved: true,
      audioUrl: '/audio/smooth.wav',
      melodyNotes: smoothMelody,
      bpm: 116
    },
    {
      id: 6,
      title: 'MATEUS OS 2000 → SPACE 2026 (Theme)',
      artist: 'Mateus Araujo Digital Sound',
      album: 'OS 2000 Original Soundtrack',
      duration: 252,
      bitrate: '320 kbps',
      genre: 'Retro Futuristic Ambient',
      melodyNotes: [
        { freq: 261, dur: 0.4, bassFreq: 65 },
        { freq: 329, dur: 0.4, bassFreq: 82 },
        { freq: 392, dur: 0.4, bassFreq: 98 },
        { freq: 523, dur: 0.4, bassFreq: 130 },
        { freq: 659, dur: 0.4, bassFreq: 164 },
        { freq: 784, dur: 0.4, bassFreq: 196 }
      ],
      bpm: 120
    }
  ];

  // Load custom tracks from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      for (const track of basePlaylist) {
        const stored = await getCustomTrackAudio(track.id);
        if (stored && isMounted) {
          const url = URL.createObjectURL(stored.blob);
          setCustomAudios((prev) => ({
            ...prev,
            [track.id]: { url, fileName: stored.fileName }
          }));
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTrackDef = basePlaylist[currentTrackIndex] || basePlaylist[0];
  const customAudioForCurrent = customAudios[currentTrackDef.id];
  const activeAudioUrl = customAudioForCurrent?.url || currentTrackDef.audioUrl;
  const currentDuration = customAudioForCurrent?.duration || currentTrackDef.duration;

  // Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioElementRef.current = audio;

    const handleTimeUpdate = () => {
      setElapsedSeconds(Math.floor(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setCustomAudios((prev) => {
          const existing = prev[currentTrackDef.id];
          if (!existing) return prev;
          return {
            ...prev,
            [currentTrackDef.id]: {
              ...existing,
              duration: Math.floor(audio.duration)
            }
          };
        });
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [currentTrackIndex]);

  // Sync volume
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Synthesizer Voice
  const playSynthesizerHarmonics = (freq: number, bassFreq?: number) => {
    try {
      if (isMuted || volume === 0) return;
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterVol = (volume / 100) * 0.055;

      // Lead Note
      const oscLead = ctx.createOscillator();
      const gainLead = ctx.createGain();
      oscLead.type = 'triangle';
      oscLead.frequency.setValueAtTime(freq, ctx.currentTime);

      gainLead.gain.setValueAtTime(masterVol, ctx.currentTime);
      gainLead.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      oscLead.connect(gainLead);
      gainLead.connect(ctx.destination);
      oscLead.start();
      oscLead.stop(ctx.currentTime + 0.58);

      // Warm Sub-harmonics
      const oscSub = ctx.createOscillator();
      const gainSub = ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, ctx.currentTime);
      gainSub.gain.setValueAtTime(masterVol * 0.4, ctx.currentTime);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      oscSub.connect(gainSub);
      gainSub.connect(ctx.destination);
      oscSub.start();
      oscSub.stop(ctx.currentTime + 0.48);

      // Deep Bass
      if (bassFreq) {
        const oscBass = ctx.createOscillator();
        const gainBass = ctx.createGain();
        oscBass.type = 'sawtooth';
        oscBass.frequency.setValueAtTime(bassFreq, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, ctx.currentTime);

        gainBass.gain.setValueAtTime(masterVol * 0.5, ctx.currentTime);
        gainBass.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

        oscBass.connect(filter);
        filter.connect(gainBass);
        gainBass.connect(ctx.destination);
        oscBass.start();
        oscBass.stop(ctx.currentTime + 0.68);
      }
    } catch {
      // Audio context policy guard
    }
  };

  // Playback Loop
  useEffect(() => {
    const audio = audioElementRef.current;
    const currentAudioUrl = customAudios[currentTrackDef.id]?.url || currentTrackDef.audioUrl;

    if (isPlaying) {
      if (currentAudioUrl && audio) {
        const currentSrcEnds = audio.src.endsWith(currentAudioUrl);
        if (!currentSrcEnds) {
          audio.src = currentAudioUrl;
          audio.currentTime = elapsedSeconds;
        }
        audio.play().catch(() => {});

        const interval = setInterval(() => {
          setEqBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
        }, 120);

        return () => clearInterval(interval);
      } else {
        // Retro Synthesizer Engine
        let noteIdx = 0;
        const melody = currentTrackDef.melodyNotes;
        const intervalMs = Math.round((60 / currentTrackDef.bpm) * 1000 * 0.75);

        const interval = setInterval(() => {
          setElapsedSeconds((prev) => {
            if (prev >= currentDuration) {
              handleNextTrack();
              return 0;
            }
            return prev + 1;
          });

          const currentNote = melody[noteIdx % melody.length];
          playSynthesizerHarmonics(currentNote.freq, currentNote.bassFreq);
          noteIdx++;

          setEqBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
        }, intervalMs);

        return () => clearInterval(interval);
      }
    } else {
      if (audio) {
        audio.pause();
      }
      setEqBars([10, 10, 10, 10, 10, 10, 10, 10]);
    }
  }, [isPlaying, currentTrackIndex, customAudios, volume, isMuted]);

  const handleTogglePlay = () => {
    soundFx.playClick();
    if (!isPlaying && audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    soundFx.playClick();
    const nextIdx = (currentTrackIndex + 1) % basePlaylist.length;
    setCurrentTrackIndex(nextIdx);
    setElapsedSeconds(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const handlePrevTrack = () => {
    soundFx.playClick();
    const prevIdx = (currentTrackIndex - 1 + basePlaylist.length) % basePlaylist.length;
    setCurrentTrackIndex(prevIdx);
    setElapsedSeconds(0);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.floor(ratio * currentDuration);

    setElapsedSeconds(targetSeconds);
    if (audioElementRef.current && (customAudios[currentTrackDef.id] || currentTrackDef.audioUrl)) {
      audioElementRef.current.currentTime = targetSeconds;
    }
  };

  // Upload Audio Processor
  const processAudioFile = async (file: File, trackId: number) => {
    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setUploadStatus('Formato inválido! Envie um arquivo de áudio (.mp3, .wav, .m4a, .ogg).');
      return;
    }

    try {
      setUploadStatus(`Salvando "${file.name}" na biblioteca Napster...`);
      await saveCustomTrackAudio(trackId, file, file.name);

      const url = URL.createObjectURL(file);
      setCustomAudios((prev) => ({
        ...prev,
        [trackId]: { url, fileName: file.name }
      }));

      // Switch to this track
      const targetIndex = basePlaylist.findIndex((t) => t.id === trackId);
      if (targetIndex !== -1) {
        setCurrentTrackIndex(targetIndex);
      }
      setElapsedSeconds(0);
      setIsPlaying(true);

      const trackName = basePlaylist.find((t) => t.id === trackId)?.title || 'faixa';
      setUploadStatus(`Sucesso! Música salva para "${trackName}"!`);
      soundFx.playWindowOpen();

      setTimeout(() => {
        setUploadStatus(null);
      }, 5000);
    } catch (err) {
      console.error(err);
      setUploadStatus('Erro ao salvar o arquivo de áudio no Napster.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const targetId = targetUploadTrackId || currentTrackDef.id;
      processAudioFile(files[0], targetId);
    }
  };

  const triggerUploadForTrack = (trackId: number) => {
    setTargetUploadTrackId(trackId);
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const targetId = targetUploadTrackId || currentTrackDef.id;
      processAudioFile(e.dataTransfer.files[0], targetId);
    }
  };

  const handleRemoveCustomAudio = async (trackId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    await deleteCustomTrackAudio(trackId);
    setCustomAudios((prev) => {
      const next = { ...prev };
      delete next[trackId];
      return next;
    });
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    setUploadStatus('Áudio personalizado removido. Retornando ao sintetizador padrão.');
    setTimeout(() => setUploadStatus(null), 3500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, (elapsedSeconds / Math.max(1, currentDuration)) * 100);

  const filteredPlaylist = basePlaylist.filter((track) => {
    if (activeTab === 'library' && !track.isFlagshipSaved) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.genre.toLowerCase().includes(q)
    );
  });

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="space-y-3 font-sans text-gray-900 select-none max-w-2xl mx-auto pb-2"
    >
      {/* Hidden File Input for MP3 Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Retro Napster Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-[11px] shadow-inner">
            N
          </div>
          <span className="text-blue-950 font-bold tracking-wide">NAPSTER MP3 AUDIO PLAYER — BIBLIOTECA SALVA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-emerald-800 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            5 MÚSICAS SALVAS
          </span>
          <span className="text-[11px] text-gray-700 font-mono">v2.4 STEREO</span>
        </div>
      </div>

      {/* Flagship Saved Songs Quick Grid */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-2.5 rounded border-2 border-blue-950 text-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <HardDrive className="w-3.5 h-3.5" />
            <span>MÚSICAS SALVAS NA CATEGORIA NAPSTER (CLIQUE PARA TOCAR):</span>
          </div>
          <span className="text-[10px] text-blue-200 font-mono">5 faixas ativas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Track 1: Linkin Park - In the End */}
          <div
            onClick={() => {
              soundFx.playClick();
              setCurrentTrackIndex(0);
              setElapsedSeconds(0);
              setIsPlaying(true);
            }}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              currentTrackIndex === 0 && isPlaying
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 hover:bg-white/15 border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                currentTrackIndex === 0 && isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-blue-800 text-cyan-300'
              }`}>
                {currentTrackIndex === 0 && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">1. In the End</div>
                <div className="text-[9.5px] text-cyan-200 truncate">Linkin Park • 3:38</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8.5px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600 font-mono">
                SALVA
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUploadForTrack(1);
                }}
                title="Subir/trocar MP3 para In The End"
                className="p-1 hover:bg-white/20 rounded text-cyan-300 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Track 2: RHCP - Californication */}
          <div
            onClick={() => {
              soundFx.playClick();
              setCurrentTrackIndex(1);
              setElapsedSeconds(0);
              setIsPlaying(true);
            }}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              currentTrackIndex === 1 && isPlaying
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 hover:bg-white/15 border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                currentTrackIndex === 1 && isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-red-900 text-red-200'
              }`}>
                {currentTrackIndex === 1 && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">2. Californication</div>
                <div className="text-[9.5px] text-red-200 truncate">Red Hot Chili Peppers • 5:21</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8.5px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600 font-mono">
                SALVA
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUploadForTrack(2);
                }}
                title="Subir/trocar MP3 para Californication"
                className="p-1 hover:bg-white/20 rounded text-red-300 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Track 3: ATC - Around the World (La La La) */}
          <div
            onClick={() => {
              soundFx.playClick();
              setCurrentTrackIndex(2);
              setElapsedSeconds(0);
              setIsPlaying(true);
            }}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              currentTrackIndex === 2 && isPlaying
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 hover:bg-white/15 border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                currentTrackIndex === 2 && isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-amber-800 text-amber-200'
              }`}>
                {currentTrackIndex === 2 && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">3. Around the World</div>
                <div className="text-[9.5px] text-amber-200 truncate">ATC (La La La) • 3:35</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8.5px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600 font-mono">
                SALVA
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUploadForTrack(3);
                }}
                title="Subir/trocar MP3 para Around the World"
                className="p-1 hover:bg-white/20 rounded text-amber-300 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Track 4: Stromae - Alors on danse */}
          <div
            onClick={() => {
              soundFx.playClick();
              setCurrentTrackIndex(3);
              setElapsedSeconds(0);
              setIsPlaying(true);
            }}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              currentTrackIndex === 3 && isPlaying
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 hover:bg-white/15 border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                currentTrackIndex === 3 && isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-purple-900 text-purple-200'
              }`}>
                {currentTrackIndex === 3 && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">4. Alors on danse</div>
                <div className="text-[9.5px] text-purple-200 truncate">Stromae • 3:26</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8.5px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600 font-mono">
                SALVA
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUploadForTrack(4);
                }}
                title="Subir/trocar MP3 para Alors on danse"
                className="p-1 hover:bg-white/20 rounded text-purple-300 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Track 5: Santana ft. Rob Thomas - Smooth */}
          <div
            onClick={() => {
              soundFx.playClick();
              setCurrentTrackIndex(4);
              setElapsedSeconds(0);
              setIsPlaying(true);
            }}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              currentTrackIndex === 4 && isPlaying
                ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 hover:bg-white/15 border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                currentTrackIndex === 4 && isPlaying ? 'bg-cyan-500 text-black animate-pulse' : 'bg-orange-800 text-orange-200'
              }`}>
                {currentTrackIndex === 4 && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">5. Smooth</div>
                <div className="text-[9.5px] text-orange-200 truncate">Santana ft. Rob Thomas • 4:58</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[8.5px] bg-emerald-900/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600 font-mono">
                SALVA
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUploadForTrack(5);
                }}
                title="Subir/trocar MP3 para Smooth (Santana)"
                className="p-1 hover:bg-white/20 rounded text-orange-300 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {uploadStatus && (
        <div className="bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs px-3 py-1.5 rounded flex items-center gap-2 font-mono shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Main Player LCD Box */}
      <div className="bg-[#101820] border-4 border-gray-600 rounded-md p-3.5 text-green-400 font-mono shadow-2xl space-y-3">
        {/* LCD Header Screen */}
        <div className="bg-[#051105] border-2 border-green-900 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-ping' : 'bg-green-900'}`} />
              <span className="font-bold tracking-wider text-green-300">
                {isPlaying ? 'TOCANDO AGORA' : 'PAUSADO'}
              </span>
              <span className="text-[10px] text-green-600">[{currentTrackDef.bitrate}]</span>
              {customAudios[currentTrackDef.id] ? (
                <span className="text-[10px] bg-green-900 text-green-200 px-1.5 py-0.2 rounded border border-green-600 font-bold">
                  MP3 LOCAL ATIVO
                </span>
              ) : currentTrackDef.audioUrl ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600 font-bold flex items-center gap-1">
                  <Disc className="w-2.5 h-2.5 animate-spin" /> ÁUDIO GRAVADO INTEGRADO
                </span>
              ) : (
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800 font-bold">
                  SINTETIZADOR DIGITAL OS 2000
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-white tracking-wide truncate max-w-sm">
              {currentTrackDef.id}. {currentTrackDef.title}
            </div>
            <div className="text-xs text-green-400 font-medium truncate">
              Artista: {currentTrackDef.artist} • <span className="text-green-500">{currentTrackDef.genre}</span>
            </div>
          </div>

          {/* Digital Timer */}
          <div className="text-right flex sm:flex-col justify-between items-end shrink-0">
            <div className="text-2xl font-bold font-mono tracking-widest text-green-400">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[10px] text-green-600 font-mono">
              TOTAL: {formatTime(currentDuration)}
            </div>
          </div>
        </div>

        {/* Equalizer Wave Visualizer */}
        <div className="h-9 bg-black/60 border border-green-900/50 rounded flex items-end justify-between px-3 py-1 gap-1.5">
          {eqBars.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-green-700 via-green-400 to-yellow-300 rounded-t-xs transition-all duration-150"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Interactive Progress Slider */}
        <div className="space-y-1">
          <div
            onClick={handleSeek}
            className="w-full bg-green-950 h-2.5 rounded-full overflow-hidden border border-green-800 cursor-pointer relative group"
            title="Clique para avançar / retroceder na música"
          >
            <div
              className="bg-green-400 h-full transition-all duration-150 group-hover:bg-green-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-green-600 font-mono">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{Math.round(progressPercent)}%</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-green-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevTrack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 cursor-pointer active:scale-95 transition"
              title="Faixa Anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded border-2 border-green-400 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSAR' : 'REPRODUZIR'}</span>
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 cursor-pointer active:scale-95 transition"
              title="Próxima Faixa"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-green-400 hover:text-white cursor-pointer"
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-24 accent-green-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-green-300 w-8">{isMuted ? '0%' : `${volume}%`}</span>
          </div>
        </div>
      </div>

      {/* Playlist Selector Table & Tabs */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-3 space-y-2.5 text-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'library'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Músicas Salvas (5)</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition ${
                activeTab === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Todas as Faixas ({basePlaylist.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no Napster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2 py-1 bg-gray-50 border border-gray-300 rounded text-[11px] font-sans w-36 sm:w-44 focus:outline-blue-600"
            />
          </div>
        </div>

        {/* Track Rows */}
        <div className="space-y-1">
          {filteredPlaylist.map((track) => {
            const isCurrent = basePlaylist[currentTrackIndex]?.id === track.id;
            const hasCustom = !!customAudios[track.id];
            const trackDuration = hasCustom && customAudios[track.id].duration ? customAudios[track.id].duration! : track.duration;

            return (
              <div
                key={track.id}
                onClick={() => {
                  soundFx.playClick();
                  const targetIdx = basePlaylist.findIndex((t) => t.id === track.id);
                  if (targetIdx !== -1) {
                    setCurrentTrackIndex(targetIdx);
                  }
                  setElapsedSeconds(0);
                  setIsPlaying(true);
                }}
                className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                  isCurrent
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-mono text-[11px] w-4 shrink-0">{track.id}.</span>
                  <span className="truncate">{track.title} — {track.artist}</span>
                  {track.isFlagshipSaved && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 font-bold ${
                      isCurrent ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      ★ Salva
                    </span>
                  )}
                  {hasCustom && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${isCurrent ? 'bg-green-400 text-black' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                      MP3 Real
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[10.5px] shrink-0">
                  <span className={isCurrent ? 'text-yellow-300' : 'text-gray-500'}>{track.genre}</span>
                  <span>{formatTime(trackDuration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerUploadForTrack(track.id);
                    }}
                    title="Importar/Salvar arquivo MP3 nesta faixa"
                    className={`p-1 rounded hover:bg-blue-700 hover:text-white cursor-pointer ${isCurrent ? 'text-blue-200' : 'text-gray-400'}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  {hasCustom && (
                    <button
                      onClick={(e) => handleRemoveCustomAudio(track.id, e)}
                      title="Remover arquivo customizado e voltar ao sintetizador"
                      className={`p-1 rounded hover:bg-red-500 hover:text-white cursor-pointer ${isCurrent ? 'text-blue-200' : 'text-gray-400'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span className="truncate">
          {customAudios[currentTrackDef.id]
            ? `ÁUDIO MP3 PERSONALIZADO: ${customAudios[currentTrackDef.id].fileName}`
            : currentTrackDef.audioUrl
            ? `ÁUDIO GRAVADO OFICIAL INTEGRADO: ${currentTrackDef.title}`
            : `SINTETIZADOR HARMONIZADO ATIVO: ${currentTrackDef.title}`}
        </span>
        <span className="shrink-0">MATEUS OS 2000 AUDIO ENGINE</span>
      </div>
    </div>
  );
};
