interface DiagonalHarmonyProps {
  colors: string[];
}

export function DiagonalHarmony({ colors }: DiagonalHarmonyProps) {
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Top triangle */}
      <polygon points="0,0 400,0 400,200" fill={c[0] || "#ccc"} />

      {/* Middle diagonal band */}
      <polygon points="400,200 400,400 200,400" fill={c[1] || "#ccc"} />

      {/* Bottom left section */}
      <polygon points="0,0 200,400 0,400" fill={c[2] || "#ccc"} />

      {/* Center triangle */}
      <polygon points="200,200 300,300 200,400" fill={c[3] || "#ccc"} />
    </svg>
  );
}
