export function BoothHero() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div
        className="pointer-events-none absolute inset-6 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,138,173,0.45) 0%, rgba(240,200,106,0.15) 40%, transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 360 420"
        className="relative h-auto w-full drop-shadow-[0_24px_48px_rgba(42,21,32,0.45)]"
        role="img"
        aria-label="Illustrated cute vintage photo booth"
      >
        <defs>
          <linearGradient id="curtain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8aad" />
            <stop offset="45%" stopColor="#f2557a" />
            <stop offset="100%" stopColor="#c23058" />
          </linearGradient>
          <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff8fb" />
            <stop offset="40%" stopColor="#f0dce6" />
            <stop offset="100%" stopColor="#d0b0c0" />
          </linearGradient>
          <linearGradient id="boothBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a2838" />
            <stop offset="100%" stopColor="#2a1520" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a3848" />
            <stop offset="100%" stopColor="#3a2030" />
          </linearGradient>
          <radialGradient id="warmGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#ffd0dc" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffd0dc" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="48" y="36" width="264" height="340" rx="28" fill="url(#boothBody)" />
        <rect
          x="54"
          y="42"
          width="252"
          height="328"
          rx="24"
          fill="none"
          stroke="rgba(255,208,220,0.25)"
          strokeWidth="1.5"
        />
        <rect x="48" y="36" width="264" height="32" rx="20" fill="url(#chrome)" />
        <text
          x="180"
          y="58"
          textAnchor="middle"
          fill="#3a2430"
          fontSize="13"
          fontFamily="Georgia, serif"
          fontWeight="700"
        >
          PHOTO BOOTH
        </text>

        {/* Little bow on top */}
        <g transform="translate(180 28)">
          <ellipse cx="-10" cy="0" rx="10" ry="7" fill="#ff8aad" />
          <ellipse cx="10" cy="0" rx="10" ry="7" fill="#ff8aad" />
          <rect x="-4" y="-5" width="8" height="10" rx="2" fill="#f2557a" />
        </g>

        <path
          d="M70 82 C90 124, 90 184, 70 244 C95 204, 100 144, 95 94 Z"
          fill="url(#curtain)"
        />
        <path
          d="M290 82 C270 124, 270 184, 290 244 C265 204, 260 144, 265 94 Z"
          fill="url(#curtain)"
        />
        <rect x="100" y="82" width="160" height="168" rx="16" fill="#1a1016" />

        <rect x="112" y="94" width="136" height="118" rx="12" fill="url(#screenGlow)" />
        <ellipse cx="180" cy="152" rx="48" ry="34" fill="url(#warmGlow)" />

        {/* Tiny hearts in screen */}
        <g opacity="0.45" fill="#ffb0c8">
          <path
            d="M150 140 c0-4 3-7 6-7 2 0 3 1 4 3 1-2 2-3 4-3 3 0 6 3 6 7 0 5-10 11-10 11s-10-6-10-11z"
            transform="scale(0.9)"
          />
        </g>

        <circle cx="180" cy="282" r="28" fill="url(#chrome)" />
        <circle cx="180" cy="282" r="18" fill="#1a1016" />
        <circle cx="174" cy="276" r="5" fill="#b8e8d8" opacity="0.9" />
        <circle cx="186" cy="288" r="3" fill="#f0c86a" opacity="0.55" />

        <g className="strip-slide-in">
          <rect x="156" y="312" width="48" height="90" rx="6" fill="#fffafc" />
          <rect x="161" y="318" width="38" height="16" rx="3" fill="#ffc0d4" />
          <rect x="161" y="338" width="38" height="16" rx="3" fill="#ffb0c8" />
          <rect x="161" y="358" width="38" height="16" rx="3" fill="#f0a0bc" />
          <rect x="161" y="378" width="38" height="14" rx="3" fill="#e890b0" />
          <text
            x="180"
            y="400"
            textAnchor="middle"
            fill="#f2557a"
            fontSize="8"
            fontFamily="cursive"
          >
            ♡
          </text>
        </g>

        <ellipse cx="180" cy="200" rx="90" ry="40" fill="#ff8aad" opacity="0.12" />
      </svg>
    </div>
  );
}
