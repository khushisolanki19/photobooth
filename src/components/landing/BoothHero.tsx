export function BoothHero() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div
        className="pointer-events-none absolute inset-8 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,77,106,0.35) 0%, rgba(226,184,74,0.12) 40%, transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 360 420"
        className="relative h-auto w-full drop-shadow-[0_24px_48px_rgba(8,2,6,0.55)]"
        role="img"
        aria-label="Illustrated vintage photo booth"
      >
        <defs>
          <linearGradient id="curtain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0455c" />
            <stop offset="45%" stopColor="#d4213a" />
            <stop offset="100%" stopColor="#7a1022" />
          </linearGradient>
          <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4f6fa" />
            <stop offset="40%" stopColor="#d5dbe6" />
            <stop offset="100%" stopColor="#8e99a8" />
          </linearGradient>
          <linearGradient id="boothBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e1c22" />
            <stop offset="100%" stopColor="#12090d" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a2830" />
            <stop offset="100%" stopColor="#241418" />
          </linearGradient>
          <radialGradient id="warmGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#ffc4a8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffc4a8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="48" y="36" width="264" height="340" rx="18" fill="url(#boothBody)" />
        <rect
          x="52"
          y="40"
          width="256"
          height="332"
          rx="16"
          fill="none"
          stroke="rgba(226,184,74,0.18)"
          strokeWidth="1"
        />
        <rect x="48" y="36" width="264" height="28" rx="14" fill="url(#chrome)" />
        <text
          x="180"
          y="56"
          textAnchor="middle"
          fill="#1c1216"
          fontSize="14"
          fontFamily="Georgia, serif"
          fontWeight="700"
        >
          PHOTO BOOTH
        </text>

        <path
          d="M70 78 C90 120, 90 180, 70 240 C95 200, 100 140, 95 90 Z"
          fill="url(#curtain)"
        />
        <path
          d="M290 78 C270 120, 270 180, 290 240 C265 200, 260 140, 265 90 Z"
          fill="url(#curtain)"
        />
        <rect x="100" y="78" width="160" height="170" rx="8" fill="#0a0608" />

        <rect x="112" y="90" width="136" height="120" rx="4" fill="url(#screenGlow)" />
        <ellipse cx="180" cy="150" rx="48" ry="32" fill="url(#warmGlow)" />

        <circle cx="180" cy="280" r="28" fill="url(#chrome)" />
        <circle cx="180" cy="280" r="18" fill="#0a0608" />
        <circle cx="174" cy="274" r="5" fill="#7ad4ff" opacity="0.85" />
        <circle cx="186" cy="286" r="3" fill="#e2b84a" opacity="0.5" />

        <g className="strip-slide-in">
          <rect x="156" y="310" width="48" height="90" rx="2" fill="#fffaf4" />
          <rect x="161" y="316" width="38" height="16" fill="#f0b8a8" />
          <rect x="161" y="336" width="38" height="16" fill="#e8a898" />
          <rect x="161" y="356" width="38" height="16" fill="#d89888" />
          <rect x="161" y="376" width="38" height="14" fill="#c88878" />
        </g>

        <ellipse cx="180" cy="200" rx="90" ry="40" fill="#ff4d6a" opacity="0.1" />
      </svg>
    </div>
  );
}
