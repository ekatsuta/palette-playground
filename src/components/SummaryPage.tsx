import { useState } from "react";
import type { PaletteWithReasoning } from "../types/palette";
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

        {/* AI Reasoning */}
        {combination.reasoning && (
          <div className={styles.reasoningSection}>
            <p className={styles.sectionLabel}>Selection Rationale</p>
            <p className={styles.reasoningText}>{combination.reasoning}</p>
          </div>
        )}

        {/* Next steps hint */}
        <div className={styles.hintSection}>
          <p className={styles.hintText}>
            Navigate right to explore these colors through classical composition principles
          </p>
        </div>
      </div>
    </div>
  );
}
