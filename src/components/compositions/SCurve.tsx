interface SCurveCompositionProps {
  colors: string[];
}

export function SCurveComposition({ colors }: SCurveCompositionProps) {
  // S-curve composition - color blocks divided by an S-curve
  // Smart color assignment based on number of available colors
  const numColors = colors.length;

  let topColor, bottomColor, accentColor, curveColor;

  if (numColors === 1) {
    // Single color: use it for everything with varying opacity
    topColor = bottomColor = accentColor = curveColor = colors[0];
  } else if (numColors === 2) {
    // Two colors: alternate between them for main sections
    topColor = colors[0];
    bottomColor = colors[1];
    accentColor = colors[1];
    curveColor = colors[0];
  } else if (numColors === 3) {
    // Three colors: distribute across all elements
    topColor = colors[1];
    bottomColor = colors[2];
    accentColor = colors[0];
    curveColor = colors[0];
  } else {
    // Four or more colors: use first 4
    topColor = colors[1];
    bottomColor = colors[2];
    accentColor = colors[3];
    curveColor = colors[0];
  }

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {/* Top section - upper color block */}
      <rect x="0" y="0" width="400" height="145" fill={topColor} />

      {/* Bottom section - lower color block */}
      <rect x="0" y="145" width="400" height="255" fill={bottomColor} />

      {/* Small accent rectangle in upper right */}
      <rect x="310" y="90" width="60" height="60" fill={accentColor} />

      {/* S-curve path flowing from lower left to upper right */}
      <path
        d="M 60 350 Q 150 280 200 200 Q 250 120 380 110"
        stroke={curveColor}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Optional: subtle fill area below the curve to emphasize the division */}
      <path
        d="M 60 350 Q 150 280 200 200 Q 250 120 380 110 L 400 110 L 400 400 L 60 400 Z"
        fill={bottomColor}
        opacity="0.3"
      />
    </svg>
  );
}
