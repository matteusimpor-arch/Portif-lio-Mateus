import React, { useState, useEffect } from 'react';
import { PROFILE_DATA } from '../data/portfolioData';

interface RetroNameDisplayProps {
  className?: string;
}

export const RetroNameDisplay: React.FC<RetroNameDisplayProps> = ({ className = '' }) => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [promptFadingOut, setPromptFadingOut] = useState<boolean>(false);
  const [promptGone, setPromptGone] = useState<boolean>(false);

  useEffect(() => {
    // Check if this session already showed the temporary phrase
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem('retro_prompt_shown') === 'true';
    } catch (e) {}

    if (alreadyShown) {
      setPromptGone(true);
      return;
    }

    // 1. Fade in temporary phrase after 1.2s
    const showTimer = setTimeout(() => {
      setShowPrompt(true);
      try {
        sessionStorage.setItem('retro_prompt_shown', 'true');
      } catch (e) {}
    }, 1200);

    // 2. Start fade out after ~6.5 seconds total
    const fadeOutTimer = setTimeout(() => {
      setPromptFadingOut(true);
    }, 6500);

    // 3. Completely remove temporary element after transition completes
    const goneTimer = setTimeout(() => {
      setPromptGone(true);
    }, 7800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none select-none flex flex-col items-center justify-center text-center p-2 ${className}`}
      aria-hidden="true"
    >
      {/* Central Name */}
      <h1
        className="font-pixel text-xs sm:text-sm md:text-base text-white/90 tracking-widest uppercase font-bold"
        style={{
          textShadow: '2px 2px 0px #000000, 3px 3px 6px rgba(0, 0, 0, 0.6)',
        }}
      >
        {PROFILE_DATA.name}
      </h1>

      {/* Discrete Subtitle: PORTFÓLIO OS // 2000 */}
      <div
        className="font-mono text-[9px] sm:text-[10px] md:text-[11px] text-white/70 tracking-[0.25em] uppercase font-bold mt-1"
        style={{
          textShadow: '1px 1px 0px #000000, 2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        PORTFÓLIO OS // 2000
      </div>

      {/* Temporary Phrase: "Explore como se fosse seu computador." */}
      {!promptGone && (
        <div
          className={`font-mono text-[10px] sm:text-[11px] text-cyan-200/90 tracking-wide mt-2 px-2.5 py-0.5 rounded bg-black/20 border border-white/10 transition-all duration-1000 ${
            showPrompt && !promptFadingOut
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-1'
          }`}
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          Explore como se fosse seu computador.
        </div>
      )}
    </div>
  );
};
