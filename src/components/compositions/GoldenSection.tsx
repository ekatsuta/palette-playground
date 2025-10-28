interface GoldenSectionProps {
  colors: string[];
}

export function GoldenSection({ colors }: GoldenSectionProps) {
  // Golden ratio ≈ 1.618, dividing canvas at ~61.8% point
  const c = colors.slice(0, 2);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Larger section (61.8%) */}
      <rect x="0" y="0" width="247" height="400" fill={c[0] || "#ccc"} />

      {/* Smaller section (38.2%) */}
      <rect x="247" y="0" width="153" height="400" fill={c[1] || "#ccc"} />
    </svg>
  );
}
