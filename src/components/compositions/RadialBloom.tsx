interface RadialBloomProps {
  colors: string[];
}

export function RadialBloom({ colors }: RadialBloomProps) {
  // Elements arranged around a central point, radiating outward like the petals of a flower or spokes on a wheel
  const c = colors;
  const segments = 8;
  const angleStep = 360 / segments;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {Array.from({ length: segments }).map((_, i) => {
        const angle1 = i * angleStep;
        const angle2 = (i + 1) * angleStep;
        const rad1 = (angle1 * Math.PI) / 180;
        const rad2 = (angle2 * Math.PI) / 180;

        const x1 = 200 + 200 * Math.cos(rad1);
        const y1 = 200 + 200 * Math.sin(rad1);
        const x2 = 200 + 200 * Math.cos(rad2);
        const y2 = 200 + 200 * Math.sin(rad2);

        const color = c[i % c.length] || "#ccc";

        return (
          <path key={i} d={`M 200 200 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`} fill={color} />
        );
      })}
    </svg>
  );
}
