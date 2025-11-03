interface GoldenTrianglesProps {
  colors: string[];
}

export function GoldenTriangles({ colors }: GoldenTrianglesProps) {
  // Golden triangles using diagonal divisions
  const c = colors.slice(0, 4);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Main diagonal triangle */}
      <polygon points="0,0 400,0 400,400" fill={c[0] || "#ccc"} />

      {/* Secondary triangle */}
      <polygon points="0,0 0,400 400,400" fill={c[1] || "#ccc"} />

      {/* Golden point accent triangles */}
      <polygon points="0,247 0,400 153,400" fill={c[2] || "#ccc"} />
      <polygon points="247,0 400,0 400,153" fill={c[3] || "#ccc"} />
    </svg>
  );
}
