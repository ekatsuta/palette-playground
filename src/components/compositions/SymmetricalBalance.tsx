interface SymmetricalBalanceProps {
  colors: string[];
}

export function SymmetricalBalance({ colors }: SymmetricalBalanceProps) {
  // Elements arranged equally on either side of a central axis - creates a mirror-like effect that conveys stability, order, and harmony
  const c = colors.slice(0, 3);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Center vertical */}
      <rect x="150" y="0" width="100" height="400" fill={c[0] || "#ccc"} />

      {/* Left side */}
      <rect x="0" y="0" width="150" height="400" fill={c[1] || "#ccc"} />

      {/* Right side (mirror) */}
      <rect x="250" y="0" width="150" height="400" fill={c[1] || "#ccc"} />

      {/* Top accent */}
      <rect x="0" y="0" width="400" height="100" fill={c[2] || "#ccc"} opacity="0.3" />
    </svg>
  );
}
