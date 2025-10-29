import { GoldenSection } from "./compositions/GoldenSection";
import { RuleOfThirds } from "./compositions/RuleOfThirds";
import { GoldenSpiral } from "./compositions/GoldenSpiral";
import type { PaletteWithReasoning } from "../types/palette";
import styles from "./SingleCompositionPage.module.css";

export const compositions = [
  { name: "Golden Section", Component: GoldenSection },
  { name: "Rule of Thirds", Component: RuleOfThirds },
  { name: "Golden Spiral", Component: GoldenSpiral },
];

interface SingleCompositionPageProps {
  combination: PaletteWithReasoning;
  compositionIndex: number;
  pageNumber: number;
}

export function SingleCompositionPage({
  combination,
  compositionIndex,
  pageNumber,
}: SingleCompositionPageProps) {
  const composition = compositions[compositionIndex];

  if (!composition) {
    return <div>Composition not found</div>;
  }

  const { Component, name } = composition;

  // Extract hex values for the composition components
  const hexColors = combination.colors.map((c) => c.hex);

  return (
    <div className={styles.compositionPage}>
      <div className={styles.compositionPageInner}>
        {/* Composition Name - at the top */}
        <div className={styles.compositionName}>
          <h2>{name}</h2>
        </div>

        {/* Composition Canvas */}
        <div className={styles.compositionCanvas}>
          <Component colors={hexColors} />
        </div>

        {/* Hex Squares - at the bottom */}
        <div className={styles.hexSquaresList}>
          {combination.colors.map((color, index) => (
            <div
              key={index}
              className={styles.hexSquare}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              <span className={styles.hexText}>{color.hex}</span>
            </div>
          ))}
        </div>

        {/* LLM Reasoning */}
        {combination.reasoning && (
          <div className={styles.reasoningSection}>
            <h3 className={styles.reasoningTitle}>Why this palette?</h3>
            <p className={styles.reasoningText}>{combination.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
