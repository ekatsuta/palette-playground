import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { SummaryPage } from "../pages/SummaryPage";
import { ReasoningPage } from "../pages/ReasoningPage";
import { SingleCompositionPage, compositions } from "../pages/SingleCompositionPage";
import { LoadingAnimation } from "../ui/LoadingAnimation";
import { RotatingPalette } from "../ui/RotatingPalette";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "./MainContent.module.css";

interface MainContentProps {
  isLoading: boolean;
  error: string | null;
  mood: string;
  setMood: Dispatch<SetStateAction<string>>;
  palette: PaletteWithReasoning | null;
  submittedMood: string;
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: (mood: string) => void;
}

export default function MainContent({
  isLoading,
  error,
  mood,
  setMood,
  palette,
  submittedMood,
  currentIndex,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onSubmit,
}: MainContentProps) {
  const totalPages = compositions.length + 2; // Summary + Reasoning + Compositions
  const showResults = palette !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood);
    }
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => hasNext && onNext(),
    onSwipedRight: () => hasPrevious && onPrevious(),
    trackMouse: false, // Only track touch events, not mouse
    preventScrollOnSwipe: true,
  });

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
                <p style={{ color: "#d4183d", fontSize: "1rem", opacity: 0.8 }}>{error}</p>
              </div>
              <div className={styles.welcomeSubdescription}>
                <p>Try describing a different mood, feeling, or creative inspiration.</p>
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
            {/* Title */}
            <div className={styles.welcomeTitle}>
              <h1 className={styles.welcomeTitleText}>Palette Playground</h1>
              <p className={styles.welcomeSubtitle}>
                Discover harmonious color palettes inspired by your creative vision
              </p>
            </div>

            {/* Rotating Palette Preview */}
            <div className={styles.rotatingPaletteSection}>
              <RotatingPalette />
            </div>

            {/* Prominent centered input */}
            <form onSubmit={handleSubmit} className={styles.welcomeForm}>
              <div className={styles.welcomeInputGroup}>
                <label className={styles.welcomeLabel}>Describe a mood, feeling, or concept</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Type your inspiration here"
                  className={styles.welcomeInput}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.welcomeButtonContainer}>
                <button type="submit" className={styles.welcomeButton} disabled={isLoading}>
                  Explore Colors
                </button>
              </div>
            </form>

            {/* Examples */}
            <div className={styles.welcomeExamplesSection}>
              <p className={styles.welcomeExamplesTitle}>Or try these</p>
              <div className={styles.welcomeExamples}>
                <button
                  type="button"
                  onClick={() => setMood("Birthday cake frosting")}
                  className={styles.welcomeExample}
                >
                  Birthday cake frosting
                </button>
                <button
                  type="button"
                  onClick={() => setMood("Cozy night by the fireplace")}
                  className={styles.welcomeExample}
                >
                  Cozy night by the fireplace
                </button>
              </div>
            </div>

            {/* Footer note */}
            <div className={styles.welcomeFooter}>
              <p className={styles.welcomeFooterText}>
                Curated combinations from the{" "}
                <a
                  target="_"
                  href="https://jinenstore.com/products/seigensha-a-dictionary-of-color-combinations"
                >
                  Sanzo Wada Dictionary of Color
                </a>{" "}
                (1933)
              </p>
              <p className={styles.welcomeFooterText} style={{ marginTop: "0.75rem" }}>
                <Link to="/palettes" style={{ textDecoration: "underline" }}>
                  Browse all color combinations
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div {...swipeHandlers} className={styles.resultsContainer}>
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
                ) : currentIndex === 1 ? (
                  <ReasoningPage combination={palette} />
                ) : (
                  <SingleCompositionPage
                    combination={palette}
                    compositionIndex={currentIndex - 2}
                    mood={submittedMood}
                    pageIndex={currentIndex}
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
