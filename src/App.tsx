import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SingleCompositionPage, compositions } from "./components/SingleCompositionPage";
import { generatePalette } from "./utils/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaletteWithReasoning } from "./types/palette";
import styles from "./App.module.css";

export default function App() {
  const [mood, setMood] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<PaletteWithReasoning | null>(null);
  const [currentCompositionIndex, setCurrentCompositionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Total number of compositions to paginate through
  const totalPages = compositions.length;

  // Call API to generate palette based on mood
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowResults(false);

    try {
      // Call API (automatically uses mock or production based on env)
      const response = await generatePalette(mood);

      // Parse the response
      const { palette } = response;

      setSelectedPalette(palette);
      setCurrentCompositionIndex(0);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate palette");
      console.error("Error generating palette:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentCompositionIndex > 0) {
      setCurrentCompositionIndex(currentCompositionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCompositionIndex < totalPages - 1) {
      setCurrentCompositionIndex(currentCompositionIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentCompositionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentCompositionIndex((prev) => Math.min(totalPages - 1, prev + 1));
      }
    };

    if (showResults) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showResults, totalPages]);

  return (
    <div className={styles.appContainer}>
      {/* Header with input - always visible */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <h1 className={styles.headerTitle}>Color Playground</h1>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Describe a mood or feeling..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.exploreButton} disabled={isLoading}>
                {isLoading ? "Generating..." : "Explore"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.welcomeScreen}
          >
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeTextSection}>
                <div className={styles.welcomeDescription}>
                  <p>Generating your perfect palette...</p>
                </div>
                <div className={styles.welcomeSubdescription}>
                  <p>Analyzing your mood and selecting the best color combination.</p>
                </div>
              </div>
            </div>
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
                <p className={styles.welcomeExample}>
                  Try: "The quiet melancholy of rain on autumn leaves"
                </p>
                <p className={styles.welcomeExample}>
                  Or: "Electric excitement and urban energy at night"
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className={styles.resultsContainer}>
            {/* Navigation arrows */}
            {currentCompositionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                aria-label="Previous composition"
              >
                <ChevronLeft />
              </button>
            )}

            {currentCompositionIndex < totalPages - 1 && (
              <button
                onClick={handleNext}
                className={`${styles.navButton} ${styles.navButtonRight}`}
                aria-label="Next composition"
              >
                <ChevronRight />
              </button>
            )}

            {/* Composition pages */}
            {selectedPalette && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCompositionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SingleCompositionPage
                    combination={selectedPalette}
                    compositionIndex={currentCompositionIndex}
                    pageNumber={currentCompositionIndex + 1}
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Page indicator */}
            <div className={styles.pageIndicator}>
              <span>
                {currentCompositionIndex + 1} / {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
