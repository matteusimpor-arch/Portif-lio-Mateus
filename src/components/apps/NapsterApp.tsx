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
  Upload,
  FileAudio,
  CheckCircle2,
  Trash2,
  FolderOpen,
  Download,
  Search,
  HardDrive,
  Plus,
  Repeat,
  Shuffle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export interface UserTrack {
  id: string;
  fileName: string;
  title: string;
  artist: string;
  duration: number; // seconds
  fileSize: number; // bytes
  blob: Blob;
  url?: string;
  dateAdded: number;
}

const DB_NAME = 'napster_user_music_db';
const STORE_NAME = 'user_tracks';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB não suportado'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbSaveTrack(track: Omit<UserTrack, 'url'>): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(track);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAllTracks(): Promise<UserTrack[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const rawTracks = req.result as Omit<UserTrack, 'url'>[];
        const tracks: UserTrack[] = rawTracks.map((t) => ({
          ...t,
          url: URL.createObjectURL(t.blob)
        }));
        // Sort by date added desc
        tracks.sort((a, b) => a.dateAdded - b.dateAdded);
        resolve(tracks);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load tracks from IndexedDB', err);
    return [];
  }
}

async function dbDeleteTrack(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete track from IndexedDB', err);
  }
}

export const NapsterApp: React.FC = () => {
  const [tracks, setTracks] = useState<UserTrack[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [eqBars, setEqBars] = useState<number[]>([15, 30, 50, 70, 85, 60, 40, 20]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved user tracks on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const loaded = await dbGetAllTracks();
      if (isMounted) {
        setTracks(loaded);
        if (loaded.length > 0) {
          setCurrentTrackId(loaded[0].id);
          setTrackDuration(loaded[0].duration || 0);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || null;

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
        const dur = Math.floor(audio.duration);
        setTrackDuration(dur);
        if (currentTrackId) {
          setTracks((prev) =>
            prev.map((t) => (t.id === currentTrackId ? { ...t, duration: dur } : t))
          );
        }
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack();
      }
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
  }, [currentTrackId, isLooping, tracks]);

  // Volume synchronization
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Playback state trigger
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    if (isPlaying && currentTrack?.url) {
      if (audio.src !== currentTrack.url) {
        audio.src = currentTrack.url;
        audio.currentTime = elapsedSeconds;
      }
      audio.play().catch((err) => {
        console.warn('Audio play error:', err);
      });

      const interval = setInterval(() => {
        setEqBars(Array.from({ length: 8 }, () => Math.floor(Math.random() * 85) + 15));
      }, 120);

      return () => clearInterval(interval);
    } else {
      audio.pause();
      setEqBars([10, 10, 10, 10, 10, 10, 10, 10]);
    }
  }, [isPlaying, currentTrackId, currentTrack?.url]);

  const handleTogglePlay = () => {
    if (!currentTrack) {
      fileInputRef.current?.click();
      return;
    }
    soundFx.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    soundFx.playClick();

    let nextIndex = 0;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);

    if (isShuffle && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    const nextTrack = tracks[nextIndex];
    if (nextTrack) {
      setCurrentTrackId(nextTrack.id);
      setElapsedSeconds(0);
      setTrackDuration(nextTrack.duration || 0);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
    }
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    soundFx.playClick();

    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIndex];

    if (prevTrack) {
      setCurrentTrackId(prevTrack.id);
      setElapsedSeconds(0);
      setTrackDuration(prevTrack.duration || 0);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || trackDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = Math.floor(ratio * trackDuration);

    setElapsedSeconds(targetSeconds);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = targetSeconds;
    }
  };

  // Helper to extract clean Title and Artist from filename
  const parseFileName = (fileName: string): { title: string; artist: string } => {
    const cleanName = fileName.replace(/\.[^/.]+$/, ''); // remove extension
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim()
      };
    }
    return {
      title: cleanName.trim(),
      artist: 'Artista Desconhecido'
    };
  };

  // Process files uploaded by user
  const handleUploadFiles = async (files: FileList | File[]) => {
    setIsProcessingUpload(true);
    const validAudioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.includes('audio') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i)) {
        validAudioFiles.push(file);
      }
    }

    if (validAudioFiles.length === 0) {
      setStatusMessage('Por favor, selecione arquivos de áudio válidos (.mp3, .wav, .ogg, .m4a, etc).');
      setIsProcessingUpload(false);
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    let newlyCreatedTracks: UserTrack[] = [];

    for (const file of validAudioFiles) {
      const { title, artist } = parseFileName(file.name);
      const trackId = `track_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Probe audio duration
      let dur = 0;
      try {
        const tempUrl = URL.createObjectURL(file);
        const tempAudio = new Audio(tempUrl);
        await new Promise((res) => {
          tempAudio.addEventListener('loadedmetadata', () => {
            dur = Math.floor(tempAudio.duration) || 0;
            res(true);
          });
          tempAudio.addEventListener('error', () => res(false));
          setTimeout(() => res(false), 1500); // timeout fallback
        });
      } catch {
        dur = 0;
      }

      const newTrack: UserTrack = {
        id: trackId,
        fileName: file.name,
        title,
        artist,
        duration: dur,
        fileSize: file.size,
        blob: file,
        url: URL.createObjectURL(file),
        dateAdded: Date.now()
      };

      // Save to IndexedDB
      await dbSaveTrack({
        id: newTrack.id,
        fileName: newTrack.fileName,
        title: newTrack.title,
        artist: newTrack.artist,
        duration: newTrack.duration,
        fileSize: newTrack.fileSize,
        blob: newTrack.blob,
        dateAdded: newTrack.dateAdded
      });

      newlyCreatedTracks.push(newTrack);
    }

    setTracks((prev) => [...prev, ...newlyCreatedTracks]);
    if (newlyCreatedTracks.length > 0) {
      const first = newlyCreatedTracks[0];
      setCurrentTrackId(first.id);
      setTrackDuration(first.duration || 0);
      setElapsedSeconds(0);
      setIsPlaying(true);
    }

    soundFx.playWindowOpen();
    setStatusMessage(
      newlyCreatedTracks.length === 1
        ? `Música "${newlyCreatedTracks[0].title}" salva na biblioteca Napster!`
        : `${newlyCreatedTracks.length} músicas adicionadas e salvas com sucesso!`
    );
    setIsProcessingUpload(false);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteTrack = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    await dbDeleteTrack(id);

    setTracks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (currentTrackId === id) {
        if (filtered.length > 0) {
          setCurrentTrackId(filtered[0].id);
          setTrackDuration(filtered[0].duration || 0);
          setElapsedSeconds(0);
        } else {
          setCurrentTrackId(null);
          setIsPlaying(false);
          setElapsedSeconds(0);
          setTrackDuration(0);
          if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.src = '';
          }
        }
      }
      return filtered;
    });

    setStatusMessage('Música removida da biblioteca.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDownloadTrack = (track: UserTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    if (!track.url) return;
    const a = document.createElement('a');
    a.href = track.url;
    a.download = track.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const progressPercent = trackDuration > 0 ? Math.min(100, (elapsedSeconds / trackDuration) * 100) : 0;

  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.fileName.toLowerCase().includes(q)
    );
  });

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`space-y-3 font-sans text-gray-900 select-none max-w-2xl mx-auto pb-2 transition-all ${
        isDragging ? 'bg-blue-50/80 ring-4 ring-blue-500 rounded-lg' : ''
      }`}
    >
      {/* Hidden File Input for MP3 / Audio upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.wma"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Retro Napster Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono shadow-xs">
        <div className="flex items-center gap-2 font-bold">
          <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-[11px] shadow-inner">
            N
          </div>
          <span className="text-blue-950 font-bold tracking-wide">
            NAPSTER MP3 PLAYER — BIBLIOTECA PESSOAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-0.5 bg-blue-800 hover:bg-blue-700 text-white font-mono text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs border border-blue-950"
          >
            <Upload className="w-3 h-3" />
            <span>SUBIR MÚSICA</span>
          </button>
          <span className="bg-emerald-800 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {tracks.length} {tracks.length === 1 ? 'MÚSICA' : 'MÚSICAS'}
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-950 text-xs px-3 py-1.5 rounded flex items-center justify-between font-mono shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-700">SALVO NO INDEXEDDB</span>
        </div>
      )}

      {/* Main Player LCD Box */}
      <div className="bg-[#101820] border-4 border-gray-600 rounded-md p-3.5 text-green-400 font-mono shadow-2xl space-y-3">
        {/* LCD Header Screen */}
        <div className="bg-[#051105] border-2 border-green-900 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPlaying ? 'bg-green-500 animate-ping' : 'bg-green-900'
                }`}
              />
              <span className="font-bold tracking-wider text-green-300">
                {currentTrack ? (isPlaying ? 'TOCANDO AGORA' : 'PAUSADO') : 'NENHUMA FAIXA CARREGADA'}
              </span>
              {currentTrack && (
                <span className="text-[10px] bg-green-950 text-green-300 px-1.5 py-0.2 rounded border border-green-700 font-bold">
                  MP3 LOCAL • {formatSize(currentTrack.fileSize)}
                </span>
              )}
            </div>

            {currentTrack ? (
              <>
                <div className="text-sm font-bold text-white tracking-wide truncate max-w-sm">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-green-400 font-medium truncate">
                  Artista: {currentTrack.artist} • <span className="text-green-500">{currentTrack.fileName}</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-400 italic py-1">
                Faça o upload do seu primeiro arquivo MP3 ou arraste uma música aqui.
              </div>
            )}
          </div>

          {/* Digital Timer */}
          <div className="text-right flex sm:flex-col justify-between items-end shrink-0">
            <div className="text-2xl font-bold font-mono tracking-widest text-green-400">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-[10px] text-green-600 font-mono">
              TOTAL: {formatTime(trackDuration)}
            </div>
          </div>
        </div>

        {/* Equalizer Wave Visualizer */}
        <div className="h-9 bg-black/60 border border-green-900/50 rounded flex items-end justify-between px-3 py-1 gap-1.5">
          {eqBars.map((height, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-green-700 via-green-400 to-yellow-300 rounded-t-xs transition-all duration-150"
              style={{ height: `${currentTrack ? height : 10}%` }}
            />
          ))}
        </div>

        {/* Interactive Progress Slider */}
        <div className="space-y-1">
          <div
            onClick={handleSeek}
            className={`w-full bg-green-950 h-2.5 rounded-full overflow-hidden border border-green-800 ${
              currentTrack ? 'cursor-pointer group' : 'opacity-40 cursor-not-allowed'
            } relative`}
            title={currentTrack ? 'Clique para avançar / retroceder' : 'Nenhuma faixa carregada'}
          >
            <div
              className="bg-green-400 h-full transition-all duration-100 group-hover:bg-green-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-green-600 font-mono">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{Math.round(progressPercent)}%</span>
            <span>{formatTime(trackDuration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-green-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevTrack}
              disabled={tracks.length === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded border border-gray-600 cursor-pointer active:scale-95 transition"
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
              disabled={tracks.length === 0}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded border border-gray-600 cursor-pointer active:scale-95 transition"
              title="Próxima Faixa"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded border cursor-pointer transition ${
                isLooping
                  ? 'bg-green-600 text-black border-green-300 font-bold'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
              }`}
              title={isLooping ? 'Repetição Ativada' : 'Ativar Repetição'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded border cursor-pointer transition ${
                isShuffle
                  ? 'bg-green-600 text-black border-green-300 font-bold'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
              }`}
              title={isShuffle ? 'Modo Aleatório Ativado' : 'Ativar Modo Aleatório'}
            >
              <Shuffle className="w-3.5 h-3.5" />
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
            <span className="text-xs font-mono text-green-300 w-8">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Playlist and Upload Area */}
      <div className="bg-white border-2 border-gray-700 shadow-sm p-3 space-y-3 text-xs">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Arquivo de Música</span>
            </button>
            <span className="text-gray-500 font-mono text-[11px]">
              {tracks.length} {tracks.length === 1 ? 'faixa salva' : 'faixas salvas'}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nas suas músicas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2 py-1 bg-gray-50 border border-gray-300 rounded text-[11px] font-sans w-40 sm:w-52 focus:outline-blue-600"
            />
          </div>
        </div>

        {/* Empty State when no tracks are uploaded */}
        {tracks.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50/80 rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-900 flex items-center justify-center transition-colors">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-blue-950">
                Sua biblioteca Napster está vazia
              </div>
              <div className="text-xs text-gray-600">
                Clique aqui ou arraste arquivos de áudio (.mp3, .wav, .m4a, .ogg) para salvar e tocar!
              </div>
            </div>
            <button className="mt-2 px-4 py-1.5 bg-blue-900 text-white font-bold rounded-md shadow-xs text-xs font-mono">
              SELECIONAR MÚSICA DO COMPUTADOR
            </button>
          </div>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filteredTracks.map((track, index) => {
              const isCurrent = currentTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    soundFx.playClick();
                    setCurrentTrackId(track.id);
                    setTrackDuration(track.duration || 0);
                    setElapsedSeconds(0);
                    setIsPlaying(true);
                  }}
                  className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                    isCurrent
                      ? 'bg-blue-900 text-white font-bold shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-400 text-emerald-950'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-xs font-bold leading-tight">
                        {index + 1}. {track.title}
                      </div>
                      <div
                        className={`truncate text-[10px] ${
                          isCurrent ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {track.artist} • {formatSize(track.fileSize)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span>{formatTime(track.duration)}</span>
                    <button
                      onClick={(e) => handleDownloadTrack(track, e)}
                      title="Baixar arquivo de música"
                      className={`p-1.5 rounded hover:bg-blue-700 hover:text-white cursor-pointer ${
                        isCurrent ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTrack(track.id, e)}
                      title="Excluir música da biblioteca"
                      className={`p-1.5 rounded hover:bg-red-600 hover:text-white cursor-pointer ${
                        isCurrent ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span className="truncate">
          {currentTrack
            ? `ÁUDIO SALVO EM REPRODUÇÃO: ${currentTrack.fileName}`
            : isProcessingUpload
            ? 'PROCESSANDO E SALVANDO MÚSICA NO INDEXEDDB...'
            : 'AGUARDANDO UPLOAD DE MÚSICA DO USUÁRIO'}
        </span>
        <span className="shrink-0 text-gray-600">NAPSTER AUDIO DB</span>
      </div>
    </div>
  );
};
