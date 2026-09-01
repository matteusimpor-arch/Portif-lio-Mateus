import React from 'react';
import { PROFILE_DATA } from '../data/portfolioData';

interface RetroNameDisplayProps {
  className?: string;
}

export const RetroNameDisplay: React.FC<RetroNameDisplayProps> = ({ className = '' }) => {
  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-center justify-center text-center p-2 ${className}`}
      aria-hidden="true"
    >
      <h1
        className="font-pixel text-xs sm:text-sm md:text-base text-white/90 tracking-widest uppercase font-bold"
        style={{
          textShadow: '2px 2px 0px #000000, 3px 3px 6px rgba(0, 0, 0, 0.6)',
        }}
      >
        {PROFILE_DATA.name}
      </h1>
    </div>
  );
};
