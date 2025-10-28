interface RuleOfThirdsProps {
  colors: string[];
}

export function RuleOfThirds({ colors }: RuleOfThirdsProps) {
  // Distribute colors across the 9 sections in an interesting pattern
  const c = colors.slice(0, 3);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Top row */}
      <rect x="0" y="0" width="133.33" height="133.33" fill={c[0] || "#ccc"} />
      <rect x="133.33" y="0" width="133.33" height="133.33" fill={c[1] || "#ccc"} />
      <rect x="266.66" y="0" width="133.34" height="133.33" fill={c[2] || "#ccc"} />

      {/* Middle row */}
      <rect x="0" y="133.33" width="133.33" height="133.33" fill={c[1] || "#ccc"} />
      <rect x="133.33" y="133.33" width="133.33" height="133.33" fill={c[2] || "#ccc"} />
      <rect x="266.66" y="133.33" width="133.34" height="133.33" fill={c[0] || "#ccc"} />

      {/* Bottom row */}
      <rect x="0" y="266.66" width="133.33" height="133.34" fill={c[2] || "#ccc"} />
      <rect x="133.33" y="266.66" width="133.33" height="133.34" fill={c[0] || "#ccc"} />
      <rect x="266.66" y="266.66" width="133.34" height="133.34" fill={c[1] || "#ccc"} />
    </svg>
  );
}
