interface LShapeProps {
  colors: string[];
}

export function LShape({ colors }: LShapeProps) {
  const c = colors.slice(0, 3);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#ccc"} />

      {/* Vertical part of L */}
      <rect x="0" y="0" width="120" height="400" fill={c[1] || "#ccc"} />

      {/* Horizontal part of L */}
      <rect x="0" y="280" width="400" height="120" fill={c[2] || "#ccc"} />
    </svg>
  );
}
