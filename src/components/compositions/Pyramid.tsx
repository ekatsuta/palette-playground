interface PyramidProps {
  colors: string[];
}

export function Pyramid({ colors }: PyramidProps) {
  // Elements are organized to form the shape of a triangle - creates a stable, harmonious, and eye-catching design
  const c = colors.slice(0, 3);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Background */}
      <rect x="0" y="0" width="400" height="400" fill={c[0] || "#ccc"} />

      {/* Main triangle pointing up */}
      <polygon points="200,80 350,320 50,320" fill={c[1] || "#ccc"} />

      {/* Secondary inverted triangle for balance */}
      <polygon points="200,320 300,160 100,160" fill={c[2] || "#ccc"} opacity="0.7" />
    </svg>
  );
}
