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
  Search
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number; // in seconds
  bitrate: string;
  genre: string;
  melody: number[];
}

export const NapsterApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [eqBars, setEqBars] = useState<number[]>([12, 34, 56, 78, 90, 65, 43, 21]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  const playlist: Track[] = [
    {
      id: 1,
      title: 'In the End (Retro Synthwave Edition)',
      artist: 'Linkin Park',
      duration: 216,
      bitrate: '128 kbps',
      genre: 'Nu-Metal / Synth',
      melody: [330, 392, 440, 494, 523, 440, 392, 330]
    },
    {
      id: 2,
      title: 'Californication (Early 2000s Mix)',
      artist: 'Red Hot Chili Peppers',
      duration: 321,
      bitrate: '192 kbps',
      genre: 'Alternative Rock',
      melody: [220, 261, 329, 392, 440, 392, 329, 261]
    },
    {
      id: 3,
      title: 'Around the World (La La La)',
      artist: 'ATC',
      duration: 215,
      bitrate: '128 kbps',
      genre: 'Eurodance 2000',
      melody: [440, 494, 523, 587, 659, 587, 523, 494]
    },
    {
      id: 4,
      title: 'Smooth (Web Audio Remix)',
      artist: 'Santana ft. Rob Thomas',
      duration: 298,
      bitrate: '160 kbps',
      genre: 'Latin Rock / Pop',
      melody: [293, 349, 440, 523, 587, 523, 440, 349]
    },
    {
      id: 5,
      title: 'MATEUS OS 2000 → SPACE 2026 (Theme)',
      artist: 'Mateus Araujo Digital Sound',
      duration: 252,
      bitrate: '320 kbps',
      genre: 'Retro Futuristic Ambient',
      melody: [261, 329, 392, 523, 659, 784, 659, 523]
    }
  ];

  const currentTrack = playlist[currentTrackIndex];

  // Play chiptune melody note on beat
  const playMelodyNote = (freq: number) => {
    try {
      if (isMuted || volume === 0) return;
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const volMultiplier = (volume / 100) * 0.03;
      gain.gain.setValueAtTime(volMultiplier, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch (e) {}
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let noteIndex = 0;

    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });

        // Trigger note from melody
        const note = currentTrack.melody[noteIndex % currentTrack.melody.length];
        playMelodyNote(note);
        noteIndex++;

        // Randomize equalizer visualizer
        setEqBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
      }, 500);
    } else {
      setEqBars([10, 10, 10, 10, 10, 10, 10, 10]);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentTrackIndex, volume, isMuted]);

  const handleTogglePlay = () => {
    soundFx.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    soundFx.playClick();
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setElapsedSeconds(0);
  };

  const handlePrevTrack = () => {
    soundFx.playClick();
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setElapsedSeconds(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(100, (elapsedSeconds / currentTrack.duration) * 100);

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-2xl mx-auto">
      {/* Title Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Music className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">NAPSTER 2000 — PLAYER DE ÁUDIO</span>
        </div>
        <span className="text-[11px] text-gray-700">v2.0 BETA • STEREO</span>
      </div>

      {/* Main Player LCD Box */}
      <div className="bg-[#101820] border-4 border-gray-600 rounded-md p-4 text-green-400 font-mono shadow-2xl space-y-4">
        {/* LCD Header Screen */}
        <div className="bg-[#051105] border-2 border-green-900 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-ping' : 'bg-green-900'}`} />
              <span className="font-bold tracking-wider text-green-300">
                {isPlaying ? 'TOCANDO AGORA' : 'PAUSADO'}
              </span>
              <span className="text-[10px] text-green-600">[{currentTrack.bitrate}]</span>
            </div>
            <div className="text-sm font-bold text-white tracking-wide truncate max-w-sm">
              {currentTrack.id}. {currentTrack.title}
            </div>
            <div className="text-xs text-green-400 font-medium">
              Artista: {currentTrack.artist} ({currentTrack.genre})
            </div>
          </div>

          {/* Digital Timer */}
          <div className="text-right flex sm:flex-col justify-between items-end">
            <div className="text-2xl font-bold font-mono tracking-widest text-green-400">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[10px] text-green-600 font-mono">
              TOTAL: {formatTime(currentTrack.duration)}
            </div>
          </div>
        </div>

        {/* Equalizer Wave Visualizer */}
        <div className="h-10 bg-black/60 border border-green-900/50 rounded flex items-end justify-between px-4 py-1 gap-2">
          {eqBars.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-green-700 via-green-400 to-yellow-300 rounded-t-xs transition-all duration-300"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Progress Slider */}
        <div className="space-y-1">
          <div className="w-full bg-green-950 h-2 rounded-full overflow-hidden border border-green-800 cursor-pointer">
            <div
              className="bg-green-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-green-600 font-mono">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{Math.round(progressPercent)}%</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-green-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevTrack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 cursor-pointer active:scale-95"
              title="Faixa Anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded border-2 border-green-400 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSAR' : 'REPRODUZIR'}</span>
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 cursor-pointer active:scale-95"
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

      {/* Playlist Selector Table */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-3 space-y-2 text-xs">
        <div className="font-bold font-mono text-blue-950 flex items-center gap-1.5 border-b border-gray-300 pb-1">
          <ListMusic className="w-4 h-4 text-blue-800" />
          <span>LISTA DE REPRODUÇÃO (NAPSTER QUEUE)</span>
        </div>

        <div className="space-y-1">
          {playlist.map((track, idx) => {
            const isCurrent = currentTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentTrackIndex(idx);
                  setElapsedSeconds(0);
                  setIsPlaying(true);
                }}
                className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                  isCurrent
                    ? 'bg-blue-900 text-white font-bold'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[11px] w-4">{track.id}.</span>
                  <span className="truncate">{track.title} — {track.artist}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10.5px] shrink-0">
                  <span className={isCurrent ? 'text-yellow-300' : 'text-gray-500'}>{track.genre}</span>
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>SINTETIZADOR WEB AUDIO API ATIVO</span>
        <span>MATEUS OS 2000 AUDIO ENGINE</span>
      </div>
    </div>
  );
};
