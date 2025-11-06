interface SCurveCompositionProps {
  colors: string[];
}

export function SCurveComposition({ colors }: SCurveCompositionProps) {
  // S-curve composition - color blocks divided by an S-curve
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Top section - upper color block */}
      <rect x="0" y="0" width="400" height="145" fill={c[1] || "#7ec8c8"} />

      {/* Bottom section - lower color block */}
      <rect x="0" y="145" width="400" height="255" fill={c[2] || "#00ff88"} />

      {/* Small accent rectangle in upper right */}
      <rect x="310" y="90" width="60" height="60" fill={c[3] || "#ff9944"} />

      {/* S-curve path flowing from lower left to upper right */}
      <path
        d="M 60 350 Q 150 280 200 200 Q 250 120 380 110"
        stroke={c[0] || "#ff4444"}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Optional: subtle fill area below the curve to emphasize the division */}
      <path
        d="M 60 350 Q 150 280 200 200 Q 250 120 380 110 L 400 110 L 400 400 L 60 400 Z"
        fill={c[2] || "#00ff88"}
        opacity="0.3"
      />
    </svg>
  );
}
