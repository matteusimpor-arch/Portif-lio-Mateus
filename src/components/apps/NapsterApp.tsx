import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc, Radio, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  bitrate: string;
  genre: string;
  frequency: number;
}

export const NapsterApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const playlist: Track[] = [
    { id: 1, title: 'In the End (2000 Hit Edition)', artist: 'Linkin Park', duration: '3:36', bitrate: '128 kbps', genre: 'Nu-Metal / Rock', frequency: 330 },
    { id: 2, title: 'Californication (Vocal Remaster)', artist: 'Red Hot Chili Peppers', duration: '5:21', bitrate: '192 kbps', genre: 'Alt Rock', frequency: 392 },
    { id: 3, title: 'Around the World (La La La)', artist: 'ATC', duration: '3:35', bitrate: '128 kbps', genre: 'Eurodance 2000', frequency: 440 },
    { id: 4, title: 'Smooth (feat. Rob Thomas)', artist: 'Santana', duration: '4:58', bitrate: '160 kbps', genre: 'Latin Rock', frequency: 349 },
    { id: 5, title: 'Digital Logistics & Synth 2026', artist: 'Mateus Araujo (OST)', duration: '4:12', bitrate: '320 kbps', genre: 'Synthwave / Ambient', frequency: 523 }
  ];

  const currentTrack = playlist[currentTrackIndex];

  // Synthesize retro ambient tone on play
  const startAudioTone = (freq: number) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(isMuted ? 0 : (volume / 100) * 0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.warn('Audio API:', e);
    }
  };

  const stopAudioTone = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    } catch (e) {}
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      startAudioTone(currentTrack.frequency);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextTrack();
            return 0;
          }
          return prev + 1.5;
        });
      }, 500);
    } else {
      stopAudioTone();
    }

    return () => {
      clearInterval(timer);
      stopAudioTone();
    };
  }, [isPlaying, currentTrackIndex]);

  const handleTogglePlay = () => {
    try { soundFx.playClick(); } catch (e) {}
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    try { soundFx.playClick(); } catch (e) {}
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setProgress(0);
  };

  const handlePrevTrack = () => {
    try { soundFx.playClick(); } catch (e) {}
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
  };

  return (
    <div className="bg-[#c0c0c0] p-4 text-black font-sans text-xs space-y-4 select-none max-w-xl mx-auto">
      {/* Napster Header */}
      <div className="bg-gradient-to-r from-[#004080] via-[#0066cc] to-[#004080] text-white p-3 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xl shadow">
            🐱🎧
          </div>
          <div>
            <h1 className="font-vt323 text-xl font-bold tracking-wider leading-none">NAPSTER 2000 • MP3 AUDIO PLAYER</h1>
            <span className="text-[10px] text-cyan-200 font-mono">P2P DIGITAL MUSIC NETWORK</span>
          </div>
        </div>
        <div className="text-[11px] font-mono bg-black/40 px-2.5 py-1 rounded border border-cyan-400/40 text-cyan-300 font-bold">
          ONLINE (2.4M USERS)
        </div>
      </div>

      {/* Now Playing Display Screen (LCD style) */}
      <div className="bg-[#0f172a] text-cyan-400 p-4 border-bevel-in space-y-3 font-mono">
        <div className="flex items-center justify-between text-[11px] border-b border-cyan-900 pb-2">
          <div className="flex items-center gap-2">
            <Disc className={`w-4 h-4 text-cyan-300 ${isPlaying ? 'animate-spin' : ''}`} />
            <span className="text-white font-bold">{isPlaying ? 'REPRODUZINDO' : 'PAUSADO'}</span>
          </div>
          <div className="text-yellow-300">{currentTrack.bitrate} • 44.1 kHz</div>
        </div>

        <div>
          <div className="text-base font-bold text-white truncate">{currentTrack.title}</div>
          <div className="text-xs text-cyan-300">{currentTrack.artist} • {currentTrack.genre}</div>
        </div>

        {/* Dynamic Visualizer Bars */}
        <div className="flex items-end gap-1 h-10 pt-2">
          {Array.from({ length: 24 }).map((_, i) => {
            const barHeight = isPlaying ? Math.sin((i + progress) * 0.5) * 40 + 50 : 15;
            return (
              <div
                key={i}
                style={{ height: `${Math.max(10, barHeight)}%` }}
                className={`flex-1 transition-all duration-150 ${
                  barHeight > 60 ? 'bg-yellow-400' : 'bg-cyan-500'
                }`}
              />
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-900 h-2.5 border border-cyan-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-yellow-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-cyan-600">
            <span>0:00</span>
            <span>{currentTrack.duration}</span>
          </div>
        </div>
      </div>

      {/* Media Controls */}
      <div className="bg-gray-200 p-3 border-bevel-out flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTrack}
            className="btn-retro p-2 cursor-pointer"
            title="Faixa Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handleTogglePlay}
            className="btn-retro px-4 py-2 flex items-center gap-1.5 font-bold text-sm bg-blue-100 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-blue-900" /> : <Play className="w-4 h-4 text-emerald-800 fill-current" />}
            <span>{isPlaying ? 'PAUSAR' : 'TOCAR'}</span>
          </button>
          <button
            onClick={handleNextTrack}
            className="btn-retro p-2 cursor-pointer"
            title="Próxima Faixa"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="cursor-pointer">
            {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-gray-800" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 cursor-pointer accent-blue-800"
          />
        </div>
      </div>

      {/* Playlist Tracks List */}
      <div className="bg-white p-2 border-bevel-in space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] font-bold text-gray-700 px-2 py-1 bg-gray-100 border-b border-gray-300">
          LISTA DE REPRODUÇÃO (MP3 LIBRARY):
        </div>
        {playlist.map((track, idx) => (
          <div
            key={track.id}
            onClick={() => {
              setCurrentTrackIndex(idx);
              setIsPlaying(true);
              setProgress(0);
              try { soundFx.playClick(); } catch (e) {}
            }}
            className={`p-2 rounded flex items-center justify-between text-xs cursor-pointer ${
              currentTrackIndex === idx
                ? 'bg-[#000080] text-white font-bold'
                : 'hover:bg-blue-50 text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-[10px] w-4">{idx + 1}.</span>
              <span className="truncate">{track.title} — {track.artist}</span>
            </div>
            <span className="font-mono text-[11px] shrink-0 ml-2">{track.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
