interface SpiralSectionProps {
  colors: string[];
}

export function SpiralSection({ colors }: SpiralSectionProps) {
  // Spiral section - divides the canvas using a spiral pattern
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Outer section */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#ccc"} />

      {/* Spiral sections using rectangles that get progressively smaller */}
      {/* First large section (left side) */}
      <rect x="0" y="0" width="247" height="400" fill={c[1] || "#999"} />

      {/* Second section (top right) */}
      <rect x="247" y="0" width="153" height="247" fill={c[2] || "#777"} />

      {/* Third section (bottom right of previous) */}
      <rect x="247" y="247" width="95" height="153" fill={c[3] || "#666"} />

      {/* Fourth section (smallest, creating spiral effect) */}
      <rect x="342" y="247" width="58" height="95" fill={c[0] || "#ccc"} />

      {/* Optional: Add spiral guide line */}
      <path
        d="M 400 400 Q 400 247 247 247 Q 95 247 95 95 Q 95 35 35 35"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
