import { useState } from "react";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "./SummaryPage.module.css";

interface SummaryPageProps {
  combination: PaletteWithReasoning;
  mood: string;
}

export function SummaryPage({ combination, mood }: SummaryPageProps) {
  const [hoveredColor, setHoveredColor] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Mood prompt */}
        <div className={styles.moodSection}>
          <p className={styles.sectionLabel}>Your Inspiration</p>
          <p className={styles.moodText}>"{mood}"</p>
        </div>

        {/* Palette ID */}
        <div className={styles.paletteId}>
          <p className={styles.sectionLabel}>Palette No. {combination.id}</p>
        </div>

        {/* Large color swatches */}
        <div className={styles.colorSwatches}>
          {combination.colors.map((color, index) => (
            <div
              key={index}
              className={styles.swatchWrapper}
              onMouseEnter={() => setHoveredColor(index)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              <div className={styles.swatch} style={{ backgroundColor: color.hex }} />
              {/* Hex and name tooltip on hover */}
              {hoveredColor === index && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipName}>{color.name}</div>
                  <div className={styles.tooltipHex}>{color.hex}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reasoning section */}
        <div className={styles.reasoningSection}>
          <p className={styles.reasoningTitle}>What you're seeing</p>
          <div className={styles.reasoningText}>
            <p>
              From the Sanzo Wada Dictionary of Color Combinations, I've selected a curated palette
              of {combination.colors.length} harmonious colors that resonates with your mood
              description. This specific combination, #{combination.id}, was chosen from 348
              thoughtfully composed palettes. Each palette in the Wada collection represents a
              carefully balanced relationship between colors, designed for visual harmony rather
              than contrast or discord.
            </p>
            <p>
              The compositions you'll see below demonstrate how these colors work together across
              different arrangements, helping you understand their relationships and practical
              applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
