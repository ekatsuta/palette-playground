interface GoldenSpiralProps {
  colors: string[];
}

export function GoldenSpiral({ colors }: GoldenSpiralProps) {
  // Fibonacci rectangles with actual spiral overlay
  const c = colors.slice(0, 5);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Fibonacci rectangles */}
      <rect x="153" y="153" width="247" height="247" fill={c[0] || "#ccc"} />
      <rect x="153" y="0" width="247" height="153" fill={c[1] || "#ccc"} />
      <rect x="0" y="0" width="153" height="153" fill={c[2] || "#ccc"} />
      <rect x="0" y="153" width="153" height="94" fill={c[3] || "#ccc"} />
      <rect x="0" y="247" width="94" height="153" fill={c[4] || "#ccc"} />

      {/* Golden spiral overlay */}
      <path
        d="M 400 153 Q 400 0 247 0 Q 0 0 0 153 Q 0 247 94 247 Q 153 247 153 306"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
      />
    </svg>
  );
}
