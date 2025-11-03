interface HorizonBalanceProps {
  colors: string[];
}

export function HorizonBalance({ colors }: HorizonBalanceProps) {
  const c = colors.slice(0, 3);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Sky - top section */}
      <rect x="0" y="0" width="400" height="160" fill={c[0] || "#ccc"} />

      {/* Horizon/middle - following golden ratio */}
      <rect x="0" y="160" width="400" height="100" fill={c[1] || "#ccc"} />

      {/* Foreground - bottom section */}
      <rect x="0" y="260" width="400" height="140" fill={c[2] || "#ccc"} />
    </svg>
  );
}
