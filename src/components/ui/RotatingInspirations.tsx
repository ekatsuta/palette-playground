import { motion } from "motion/react";
import type { SanzoWadaColor } from "../../types/palette";
import styles from "./RotatingInspirations.module.css";

interface RotatingInspirationsProps {
  inspirations: string;
  colors: SanzoWadaColor[];
}

export function RotatingInspirations({ inspirations, colors }: RotatingInspirationsProps) {
  // Parse the inspirations string into individual bullet points
  const bulletPoints = inspirations
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.substring(1).trim()); // Remove the dash and trim

  const count = bulletPoints.length;

  if (count === 0) {
    return <p className={styles.inspiration}>{inspirations}</p>;
  }

  // Dynamic cycle duration based on number of items (each item shows for ~2s)
  const cycleDuration = count * 2;

  // Calculate timing for each bullet point
  const getTimings = (index: number) => {
    const segmentDuration = 1 / count;
    const fadeTransition = 0.04; // Small constant for smooth, quick transitions

    // Start and end times for this segment
    const segmentStart = index * segmentDuration;
    const segmentEnd = (index + 1) * segmentDuration;

    // Calculate transition points
    const fadeInEnd = segmentStart + fadeTransition;
    const fadeOutStart = segmentEnd - fadeTransition;

    return [0, segmentStart, fadeInEnd, fadeOutStart, segmentEnd, 1];
  };

  return (
    <div className={styles.container}>
      {bulletPoints.map((point, index) => {
        // Cycle through palette colors
        const color = colors[index % colors.length];

        return (
          <motion.p
            key={index}
            className={styles.inspiration}
            animate={{
              opacity: [0, 0, 1, 1, 0, 0],
            }}
            transition={{
              opacity: {
                duration: cycleDuration,
                repeat: Infinity,
                ease: "easeInOut",
                times: getTimings(index),
              },
            }}
            style={{
              color: color.hex,
            }}
          >
            {point}
          </motion.p>
        );
      })}
    </div>
  );
}
