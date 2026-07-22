/** Soft floating doodles for the landing atmosphere — decorative only */
export function CuteSparks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Sparkle className="twinkle absolute top-[12%] left-[8%] text-[#ffd0e0]" size={18} delay="0s" />
      <Sparkle className="twinkle absolute top-[22%] right-[10%] text-[#ffe4a8]" size={14} delay="0.6s" />
      <Heart className="bob absolute top-[38%] right-[6%] text-[#ff8aad]" size={22} delay="0.2s" />
      <Heart className="bob absolute bottom-[22%] left-[7%] text-[#ffb0c8]" size={16} delay="1s" />
      <Sparkle className="twinkle absolute bottom-[18%] right-[14%] text-[#b8e8d8]" size={16} delay="1.2s" />
      <Bow className="bob absolute top-[58%] left-[4%] hidden text-[#ff9abb] sm:block" size={28} delay="0.4s" />
      <Star className="twinkle absolute top-[70%] right-[8%] text-[#ffe4a8]" size={18} delay="0.9s" />
    </div>
  );
}

function Sparkle({
  className,
  size,
  delay,
}: {
  className?: string;
  size: number;
  delay: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ animationDelay: delay }}
    >
      <path d="M12 2l1.4 7.2L20 12l-6.6 2.8L12 22l-1.4-7.2L4 12l6.6-2.8L12 2z" />
    </svg>
  );
}

function Heart({
  className,
  size,
  delay,
}: {
  className?: string;
  size: number;
  delay: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ animationDelay: delay }}
    >
      <path d="M12 21s-6.7-4.2-9.2-8.1C.8 9.7 2.2 6 5.6 6c1.9 0 3.2 1.1 4 2.2.8-1.1 2.1-2.2 4-2.2 3.4 0 4.8 3.7 2.8 6.9C18.7 16.8 12 21 12 21z" />
    </svg>
  );
}

function Star({
  className,
  size,
  delay,
}: {
  className?: string;
  size: number;
  delay: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ animationDelay: delay }}
    >
      <path d="M12 2l2.9 6.6L22 10l-5 4.4L18.2 22 12 18.2 5.8 22 7 14.4 2 10l7.1-1.4L12 2z" />
    </svg>
  );
}

function Bow({
  className,
  size,
  delay,
}: {
  className?: string;
  size: number;
  delay: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.7}
      viewBox="0 0 40 28"
      fill="currentColor"
      style={{ animationDelay: delay }}
    >
      <ellipse cx="10" cy="14" rx="10" ry="8" />
      <ellipse cx="30" cy="14" rx="10" ry="8" />
      <rect x="16" y="9" width="8" height="10" rx="2" />
    </svg>
  );
}
