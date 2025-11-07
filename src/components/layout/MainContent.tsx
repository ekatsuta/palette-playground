import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SummaryPage } from "../pages/SummaryPage";
import { SingleCompositionPage, compositions } from "../pages/SingleCompositionPage";
import { LoadingAnimation } from "../ui/LoadingAnimation";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "../../App.module.css";

interface MainContentProps {
  isLoading: boolean;
  error: string | null;
  palette: PaletteWithReasoning | null;
  submittedMood: string;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export default function MainContent({
  isLoading,
  error,
  palette,
  submittedMood,
  currentIndex,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
}: MainContentProps) {
  const totalPages = compositions.length + 1;
  const showResults = palette !== null;

  return (
    <div className={styles.mainContent}>
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.welcomeScreen}
        >
          <LoadingAnimation />
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.welcomeScreen}
        >
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeTextSection}>
              <div className={styles.welcomeDescription}>
                <p style={{ color: "#d4183d" }}>Error: {error}</p>
              </div>
              <div className={styles.welcomeSubdescription}>
                <p>Please try again with a different mood description.</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : !showResults ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={styles.welcomeScreen}
        >
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeTextSection}>
              <div className={styles.welcomeDescription}>
                <p>Discover harmonious color palettes inspired by your creative vision.</p>
              </div>
              <div className={styles.welcomeSubdescription}>
                <p>
                  Enter a mood, feeling, or concept above to explore curated combinations from the
                  Sanzo Wada Dictionary of Color.
                </p>
              </div>
            </div>

            <div className={styles.welcomeExamples}>
              <p className={styles.welcomeExample}>Try: "Ocean meeting sky at dusk"</p>
              <p className={styles.welcomeExample}>
                Or: "Electric excitement and urban energy at night"
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className={styles.resultsContainer}>
          {/* Navigation arrows */}
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              aria-label="Previous composition"
            >
              <ChevronLeft />
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNext}
              className={`${styles.navButton} ${styles.navButtonRight}`}
              aria-label="Next composition"
            >
              <ChevronRight />
            </button>
          )}

          {/* Composition pages */}
          {palette && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {currentIndex === 0 ? (
                  <SummaryPage combination={palette} mood={submittedMood} />
                ) : (
                  <SingleCompositionPage
                    combination={palette}
                    compositionIndex={currentIndex - 1}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Page indicator */}
          <div className={styles.pageIndicator}>
            <span>
              {currentIndex + 1} / {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
