interface GoldenTrianglesProps {
  colors: string[];
}

export function GoldenTriangles({ colors }: GoldenTrianglesProps) {
  // Golden triangles using diagonal divisions based on golden ratio
  // Smart color assignment based on number of available colors
  const numColors = colors.length;

  let color1, color2, color3, color4;

  if (numColors === 1) {
    color1 = color2 = color3 = color4 = colors[0];
  } else if (numColors === 2) {
    color1 = colors[0];
    color2 = colors[1];
    color3 = colors[1];
    color4 = colors[0];
  } else if (numColors === 3) {
    color1 = colors[0];
    color2 = colors[1];
    color3 = colors[2];
    color4 = colors[1];
  } else {
    color1 = colors[0];
    color2 = colors[1];
    color3 = colors[2];
    color4 = colors[3];
  }

  // Golden ratio point: ~247 (400 / 1.618)
  const goldenPoint = 247;

  // Intersection point of the two secondary diagonals with the main diagonal
  // Main diagonal goes from (0,400) to (400,0)
  // The intersection point is at approximately (247, 153)
  const intersectionX = 247;
  const intersectionY = 153;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Upper-left large triangle */}
      <polygon points={`0,0 ${goldenPoint},400 0,400`} fill={color1} />

      {/* Lower-right large triangle */}
      <polygon points={`400,400 ${153},0 400,0`} fill={color2} />

      {/* Upper-right small triangle */}
      <polygon points={`${153},0 400,0 ${intersectionX},${intersectionY}`} fill={color3} />

      {/* Lower-left small triangle */}
      <polygon
        points={`0,400 ${goldenPoint},400 ${intersectionX},${intersectionY}`}
        fill={color4}
      />

      {/* Diagonal guide lines */}
      <line x1="0" y1="400" x2="400" y2="0" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
      <line x1="0" y1="0" x2={goldenPoint} y2="400" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
      <line x1="400" y1="400" x2="153" y2="0" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
    </svg>
  );
}
