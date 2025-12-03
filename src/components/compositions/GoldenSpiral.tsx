interface GoldenSpiralProps {
  colors: string[];
}

export function GoldenSpiral({ colors }: GoldenSpiralProps) {
  // Fibonacci sequence scaled to fill the full page
  const c = colors.slice(0, 5);

  return (
    <svg viewBox="0 0 800 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Fibonacci squares spiraling counter-clockwise */}

      {/* 1. Largest square (left): 494x494 */}
      <rect x="0" y="153" width="494" height="494" fill={c[0] || "#ccc"} />

      {/* 2. Square (top-right): 306x306 */}
      <rect x="494" y="153" width="306" height="306" fill={c[1] || "#ccc"} />

      {/* 3. Square (bottom-right of #2): 188x188 */}
      <rect x="612" y="459" width="188" height="188" fill={c[2] || "#ccc"} />

      {/* 4. Square (left of #3): 118x118 */}
      <rect x="494" y="529" width="118" height="118" fill={c[3] || "#ccc"} />

      {/* 5. Square (above #4): 70x70 */}
      <rect x="542" y="459" width="70" height="70" fill={c[4] || "#ccc"} />

      {/* Continuous Fibonacci spiral */}
      <path
        d="M 0 647
           A 494 494 0 0 1 494 153
           A 306 306 0 0 1 800 459
           A 188 188 0 0 1 612 647
           A 118 118 0 0 1 494 529
           A 70 70 0 0 1 542 459"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="3"
      />
    </svg>
  );
}
