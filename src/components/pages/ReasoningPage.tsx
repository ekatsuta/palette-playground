import type { PaletteWithReasoning } from "../../types/palette";
import { RotatingInspirations } from "../ui/RotatingInspirations";
import styles from "./ReasoningPage.module.css";

interface ReasoningPageProps {
  combination: PaletteWithReasoning;
}

export function ReasoningPage({ combination }: ReasoningPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>These colors remind us of...</h2>
        </div>

        <div className={styles.reasoningSection}>
          <RotatingInspirations
            inspirations={combination.inspirations}
            colors={combination.colors}
          />
        </div>

        <div className={styles.hintSection}>
          <p className={styles.hintText}>
            Navigate below to explore these colors through classical composition principles
          </p>
        </div>
      </div>
    </div>
  );
}
