import type { PaletteWithReasoning } from "../../types/palette";
import styles from "./ReasoningPage.module.css";

interface ReasoningPageProps {
  combination: PaletteWithReasoning;
}

export function ReasoningPage({ combination }: ReasoningPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Why was this palette chosen?</h2>
        </div>

        <div className={styles.reasoningSection}>
          <p className={styles.reasoningText}>{combination.reasoning}</p>
        </div>

        <div className={styles.hintSection}>
          <p className={styles.hintText}>
            Navigate right to explore these colors through classical composition principles
          </p>
        </div>
      </div>
    </div>
  );
}
