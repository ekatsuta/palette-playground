interface FulcrumCompositionProps {
  colors: string[];
}

export function FulcrumComposition({ colors }: FulcrumCompositionProps) {
  // Also known as steelyard composition
  // Large object or mass is placed near the center and counterbalanced by a smaller object or mass placed farther away from the center
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#f5f5f5"} />

      {/* Fulcrum line - the balance point */}
      <line
        x1="0"
        y1="200"
        x2="400"
        y2="200"
        stroke={c[3] || "#ccc"}
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Large weight near center/fulcrum - positioned closer to the center */}
      <rect x="80" y="140" width="120" height="140" fill={c[1] || "#333"} opacity="0.85" />

      {/* Medium accent element overlapping large mass */}
      <rect x="140" y="160" width="80" height="100" fill={c[2] || "#666"} opacity="0.7" />

      {/* Small weight on the far right - positioned further from center for balance */}
      <rect x="320" y="170" width="50" height="70" fill={c[3] || "#999"} opacity="0.75" />

      {/* Additional smaller accent on the right for visual interest */}
      <rect x="280" y="190" width="30" height="40" fill={c[2] || "#666"} opacity="0.6" />

      {/* Small element on far left edge for subtle balance */}
      <rect x="30" y="185" width="25" height="35" fill={c[3] || "#999"} opacity="0.65" />
    </svg>
  );
}
