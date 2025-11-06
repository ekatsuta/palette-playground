interface CircularCompositionProps {
  colors: string[];
}

export function CircularComposition({ colors }: CircularCompositionProps) {
  // Circular composition - concentric circles or circular arrangement
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#ccc"} />

      {/* Concentric circles from outside to inside */}
      <circle cx="200" cy="200" r="180" fill={c[1] || "#999"} />
      <circle cx="200" cy="200" r="120" fill={c[2] || "#777"} />
      <circle cx="200" cy="200" r="60" fill={c[3] || "#666"} />
      <circle cx="200" cy="200" r="20" fill={c[0] || "#ccc"} />
    </svg>
  );
}
