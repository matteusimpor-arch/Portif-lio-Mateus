import React from 'react';

interface RetroCentralWatermarkProps {
  className?: string;
  opacity?: number;
}

/**
 * RetroCentralWatermark
 * Discrete, authentic watermark symbol in the center of the MATEUS OS 00 desktop.
 * Concept: Pixel-art geometric "M" + segmented pixel-art orbit + 2 beacon dots.
 * Represents: Mateus, Technology, Time, Evolution, OS 00.
 */
export const RetroCentralWatermark: React.FC<RetroCentralWatermarkProps> = ({
  className = '',
  opacity = 0.15,
}) => {
  return (
    <div
      className={`pointer-events-none select-none flex items-center justify-center transition-opacity duration-700 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="relative w-[clamp(140px,26vw,320px)] h-[clamp(140px,26vw,320px)] flex items-center justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-xs"
          shapeRendering="crispEdges"
        >
          <defs>
            {/* Retro 16-bit Dither / Grid Pattern */}
            <pattern id="pixelGrid" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="#ffffff" fillOpacity="0.04" />
            </pattern>
          </defs>

          {/* 1. Subtle Outer Pixel Guideline / Bounding Orbit Halo */}
          <ellipse
            cx="100"
            cy="100"
            rx="88"
            ry="36"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            transform="rotate(-28 100 100)"
            opacity="0.5"
          />

          {/* 2. Main Pixelated Orbit (Segmented lines & stepped pixels) */}
          <g transform="rotate(-28 100 100)">
            {/* Segmented Orbit Ring */}
            <ellipse
              cx="100"
              cy="100"
              rx="84"
              ry="32"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6 4 2 4"
              opacity="0.8"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="84"
              ry="32"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="2 12"
              opacity="0.9"
            />

            {/* Orbit Point 1 (Evolution / Time Beacon) */}
            <g transform="translate(184, 100)">
              <rect x="-4" y="-4" width="8" height="8" fill="#000080" />
              <rect x="-3" y="-3" width="6" height="6" fill="#38bdf8" />
              <rect x="-1.5" y="-1.5" width="3" height="3" fill="#ffffff" />
            </g>

            {/* Orbit Point 2 (Progress Beacon) */}
            <g transform="translate(16, 100)">
              <rect x="-3" y="-3" width="6" height="6" fill="#000080" />
              <rect x="-2" y="-2" width="4" height="4" fill="#60a5fa" />
              <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
            </g>
          </g>

          {/* 3. Central Geometric Pixelated "M" Monogram */}
          {/* Shadow / Base layer for authentic 2000s pixel depth */}
          <g transform="translate(2, 2)">
            <path
              d="
                M 60 144
                L 60 56
                L 76 56
                L 100 96
                L 124 56
                L 140 56
                L 140 144
                L 124 144
                L 124 92
                L 106 122
                L 94 122
                L 76 92
                L 76 144
                Z
              "
              fill="#000080"
              opacity="0.6"
            />
          </g>

          {/* Main "M" Structure in Clean Retro Palette */}
          <path
            d="
              M 60 144
              L 60 56
              L 76 56
              L 100 96
              L 124 56
              L 140 56
              L 140 144
              L 124 144
              L 124 92
              L 106 122
              L 94 122
              L 76 92
              L 76 144
              Z
            "
            fill="#ffffff"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinejoin="miter"
          />

          {/* Stepped Pixel Highlights on M Bevel */}
          <rect x="62" y="58" width="12" height="84" fill="#e0f2fe" opacity="0.35" />
          <rect x="126" y="58" width="12" height="84" fill="#bae6fd" opacity="0.35" />
          <polygon points="76,58 100,98 100,106 76,66" fill="#ffffff" opacity="0.6" />
          <polygon points="124,58 100,98 100,106 124,66" fill="#38bdf8" opacity="0.4" />

          {/* Subtle 16-bit Dither Texture on M */}
          <rect x="60" y="56" width="80" height="88" fill="url(#pixelGrid)" />
        </svg>
      </div>
    </div>
  );
};
