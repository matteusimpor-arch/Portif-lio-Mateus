import React from 'react';

interface MateusLogoProps {
  mode?: 'retro' | 'space';
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
}

export const MateusLogo: React.FC<MateusLogoProps> = ({
  mode = 'space',
  size = 'md',
  animated = true,
  className = '',
  showText = false,
}) => {
  // Determine pixel size
  let pxSize = 36;
  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'sm': pxSize = 20; break;
      case 'md': pxSize = 36; break;
      case 'lg': pxSize = 56; break;
      case 'xl': pxSize = 96; break;
    }
  }

  // =========================================================================
  // RETRO 2000 PIXELATED EDITION (OS '00)
  // =========================================================================
  if (mode === 'retro') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <div
          style={{ width: pxSize, height: pxSize }}
          className="relative shrink-0 rounded-full bg-[#030712] border border-[#38bdf8]/40 shadow-xs flex items-center justify-center overflow-hidden p-0.5"
          title="Mateus OS - Logotipo Oficial"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            shapeRendering="crispEdges"
          >
            {/* Retro Dark Circular Canvas */}
            <circle cx="50" cy="50" r="48" fill="#030712" />

            {/* Pixelated / Dotted Retro Orbit Ring */}
            <ellipse
              cx="50"
              cy="50"
              rx="40"
              ry="15"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              transform="rotate(-26 50 50)"
            />

            {/* Retro Geometric M with Hard Edges */}
            <path
              d="M 30 70 L 30 30 L 50 52 L 70 30 L 70 70 L 60 70 L 60 45 L 50 56 L 40 45 L 40 70 Z"
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth="1.5"
            />

            {/* Pixel Beacon Point on Orbit */}
            <g transform="rotate(-26 50 50)">
              <rect x="76" y="47" width="5" height="5" fill="#38bdf8" />
              <rect x="77" y="48" width="3" height="3" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {showText && (
          <div className="flex flex-col leading-tight">
            <span className="font-pixel text-xs text-white tracking-wider">MATEUS<span className="text-[#0080ff]">OS</span></span>
            <span className="font-mono text-[9px] text-[#38bdf8]">v2.6 PORTFOLIO</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // MODERN QUANTUM SPACE 2026 EDITION (SPACE)
  // =========================================================================
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        style={{ width: pxSize, height: pxSize }}
        className="relative shrink-0 rounded-full bg-[#020617] border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center p-0.5 group"
        title="Mateus Portfolio OS · Identidade Visual Oficial"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <radialGradient id={`logo-bg-${pxSize}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#0c1a3b" />
              <stop offset="70%" stop-color="#030712" />
              <stop offset="100%" stop-color="#020617" />
            </radialGradient>

            <linearGradient id={`logo-m-grad-${pxSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="50%" stop-color="#e0f2fe" />
              <stop offset="100%" stop-color="#38bdf8" />
            </linearGradient>

            <linearGradient id={`logo-orbit-grad-${pxSize}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="50%" stop-color="#22d3ee" />
              <stop offset="100%" stop-color="#0369a1" />
            </linearGradient>

            <filter id={`logo-glow-${pxSize}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Deep Space Circular Disc */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill={`url(#logo-bg-${pxSize})`}
            stroke="#0ea5e9"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />

          {/* Static Ambient Orbit Ring */}
          <g transform="rotate(-28 50 50)">
            <ellipse
              cx="50"
              cy="50"
              rx="41"
              ry="15"
              fill="none"
              stroke={`url(#logo-orbit-grad-${pxSize})`}
              strokeWidth="2.2"
              strokeDasharray="4 2.5"
              opacity="0.5"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="41"
              ry="15"
              fill="none"
              stroke={`url(#logo-orbit-grad-${pxSize})`}
              strokeWidth="1.8"
              opacity="0.9"
            />
          </g>

          {/* Bold Geometric M Monogram Logo */}
          <g filter={`url(#logo-glow-${pxSize})`}>
            <path
              d="M 29 70 L 29 31 L 50 53 L 71 31 L 71 70 L 62 70 L 62 45 L 50 58 L 38 45 L 38 70 Z"
              fill={`url(#logo-m-grad-${pxSize})`}
              stroke="#0284c7"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </g>

          {/* Animated or Static Orbit Beacon Node */}
          {animated && pxSize >= 28 ? (
            <g transform="rotate(-28 50 50)">
              {/* CSS Rotating Beacon Wrapper */}
              <g className="animate-[spin_8s_linear_infinite] origin-[50px_50px]">
                <g transform="translate(41, 0)">
                  <circle cx="50" cy="50" r="3.2" fill="#ffffff" />
                  <circle cx="50" cy="50" r="6" fill="#38bdf8" opacity="0.4" />
                </g>
              </g>
            </g>
          ) : (
            <g transform="rotate(-28 50 50)">
              <g transform="translate(77, 59)">
                <circle cx="0" cy="0" r="3.2" fill="#ffffff" />
                <circle cx="0" cy="0" r="6" fill="#38bdf8" opacity="0.5" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white tracking-wider">
            <span>MATEUS</span>
            <span className="text-cyan-400">OS</span>
            <span className="text-[10px] px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">2026</span>
          </div>
          <span className="font-mono text-[9px] text-slate-400 tracking-tight">AI &amp; PROMPT ARCHITECTURE</span>
        </div>
      )}
    </div>
  );
};
