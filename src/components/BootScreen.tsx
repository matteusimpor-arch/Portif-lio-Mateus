import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';

interface BootScreenProps {
  onBootComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const TOTAL_SEGMENTS = 18;
  const [filledSegments, setFilledSegments] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Progressive segment loading sequence
  useEffect(() => {
    try {
      soundFx.playBootSound();
    } catch (e) {
      console.warn(e);
    }

    const interval = setInterval(() => {
      setFilledSegments((prev) => {
        if (prev >= TOTAL_SEGMENTS) {
          clearInterval(interval);
          setIsReady(true);
          return TOTAL_SEGMENTS;
        }
        return prev + 1;
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  // When all segments are filled, auto-boot into desktop after a brief delay
  useEffect(() => {
    if (isReady && !isExiting) {
      const timer = setTimeout(() => {
        handleEnter();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isReady, isExiting]);

  // Keyboard navigation (Enter, Space, or any key to skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExiting]);

  const handleEnter = () => {
    if (isExiting) return;
    try {
      soundFx.playClick();
    } catch (err) {
      console.warn(err);
    }
    setIsExiting(true);
    setTimeout(() => {
      onBootComplete();
    }, 380);
  };

  return (
    <div
      onClick={handleEnter}
      className={`fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50 select-none cursor-pointer overflow-hidden transition-all duration-300 ${
        isExiting ? 'scale-105 opacity-0 filter blur-xs brightness-150' : 'opacity-100'
      }`}
    >
      {/* Centered Splash Container matching Screenshot */}
      <div className="flex flex-col items-center justify-center text-center px-4 max-w-2xl w-full">
        {/* Main Pixel Title: MateusOS '00 */}
        <div className="mb-6 select-none transform transition-transform hover:scale-102">
          <h1 className="font-pixel text-3xl sm:text-5xl md:text-6xl text-white tracking-normal font-bold flex items-center justify-center">
            <span>Mateus</span>
            <span className="text-[#0080ff]">OS</span>
            <span className="ml-2 sm:ml-3">'00</span>
          </h1>
        </div>

        {/* Subtitle in cyan/sky blue pixel font */}
        <p className="font-pixel text-[9px] sm:text-[11px] md:text-xs text-[#38bdf8] tracking-tight mb-8 leading-relaxed">
          Logística &amp; Engenharia de Prompt · rebuilt for 2026
        </p>

        {/* Authentic Windows 95/98/2000 Segmented Progress Bar */}
        <div className="w-72 sm:w-88 md:w-96 h-6 sm:h-7 bg-[#d4d0c8] p-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white shadow-inner flex items-center gap-1">
          {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
            const isFilled = index < filledSegments;
            return (
              <div
                key={index}
                className={`flex-1 h-full transition-colors duration-75 ${
                  isFilled
                    ? 'bg-[#000080] border-t border-l border-[#0000a0] border-r border-b border-[#000050]'
                    : 'bg-[#d4d0c8]'
                }`}
              />
            );
          })}
        </div>

        {/* Status text below progress bar */}
        <div className="mt-4 h-6 flex items-center justify-center">
          <span className="font-pixel text-[10px] sm:text-xs text-gray-300">
            {isReady ? 'Ready.' : 'Loading...'}
          </span>
        </div>

        {/* Subtle hint for user */}
        <div className="mt-12 text-[10px] font-mono text-gray-700 tracking-wider">
          [ Clique em qualquer lugar ou pressione Enter para iniciar ]
        </div>
      </div>
    </div>
  );
};
