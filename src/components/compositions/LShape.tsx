interface LShapeProps {
  colors: string[];
}

export function LShape({ colors }: LShapeProps) {
  // Main elements of a composition are arranged in the shape of the letter “L.”
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#f5f5f5"} />

      {/* Main vertical element - tall and substantial, positioned one third from left */}
      <rect x="100" y="40" width="45" height="310" fill={c[1] || "#333"} opacity="0.9" rx="3" />

      {/* Horizontal base element - wide and grounding, one third from bottom */}
      <rect x="20" y="260" width="380" height="60" fill={c[2] || "#666"} opacity="0.85" rx="3" />

      {/* Secondary vertical element on right - smaller for balance */}
      <rect x="310" y="120" width="30" height="140" fill={c[3] || "#999"} opacity="0.75" rx="2" />

      {/* Optional: small accent element near secondary vertical */}
      <rect x="285" y="180" width="20" height="70" fill={c[3] || "#999"} opacity="0.6" rx="2" />
    </svg>
  );
}
