import type { Dispatch, SetStateAction } from "react";
import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { SummaryPage } from "../pages/SummaryPage";
import { ReasoningPage } from "../pages/ReasoningPage";
import { SingleCompositionPage, compositions } from "../pages/SingleCompositionPage";
import { LoadingAnimation } from "../ui/LoadingAnimation";
import { RotatingPalette } from "../ui/RotatingPalette";
import { ScrollPagination } from "../ui/ScrollPagination";
import { useScrollKeyboardNav } from "../../hooks/useScrollKeyboardNav";
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
  onSubmit: (mood: string) => void;
  setCurrentIndex: (index: number) => void;
  onEditPalette?: () => void;
  onRevertPalette?: () => void;
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
  onSubmit,
  setCurrentIndex,
  onEditPalette,
  onRevertPalette,
}: MainContentProps) {
  const totalPages = compositions.length + 2; // Summary + Reasoning + Compositions
  const showResults = palette !== null;

  // Page labels for scroll pagination
  const pageLabels = ["Summary", "Reasoning", ...compositions.map((c) => c.name)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood);
    }
  };

  // Refs for each page section
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to specific page
  const scrollToPage = (index: number) => {
    const element = pageRefs.current[index];
    const container = containerRef.current;
    if (element && container) {
      setCurrentIndex(index);
      container.scrollTo({ top: element.offsetTop, behavior: "smooth" });
    }
  };

  // Intersection Observer to track current page
  useEffect(() => {
    if (!showResults || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = pageRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0, 0.5, 1],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [showResults]);

  // Keyboard navigation
  useScrollKeyboardNav({
    enabled: showResults,
    hasNext,
    hasPrevious,
    currentIndex,
    onNavigate: scrollToPage,
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
            <div className={styles.welcomeTitle}>
              <h1 className={styles.welcomeTitleText}>Palette Playground</h1>
              <p className={styles.welcomeSubtitle}>
                Discover harmonious color palettes inspired by your creative vision
              </p>
            </div>

            <div className={styles.rotatingPaletteSection}>
              <RotatingPalette />
            </div>

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
        <>
          <ScrollPagination
            totalPages={totalPages}
            currentPage={currentIndex}
            onPageClick={scrollToPage}
            pageLabels={pageLabels}
          />

          <div ref={containerRef} className={styles.resultsContainer}>
            {palette && (
              <>
                {/* Summary Page */}
                <div
                  ref={(el) => {
                    pageRefs.current[0] = el;
                  }}
                  className={styles.pageSection}
                >
                  <SummaryPage
                    combination={palette}
                    mood={submittedMood}
                    onEditPalette={onEditPalette}
                    onRevertPalette={onRevertPalette}
                  />
                </div>

                {/* Reasoning Page */}
                <div
                  ref={(el) => {
                    pageRefs.current[1] = el;
                  }}
                  className={styles.pageSection}
                >
                  <ReasoningPage combination={palette} />
                </div>

                {/* Composition Pages */}
                {compositions.map((comp, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      pageRefs.current[index + 2] = el;
                    }}
                    className={styles.pageSection}
                  >
                    <SingleCompositionPage
                      combination={palette}
                      compositionIndex={index}
                      mood={submittedMood}
                      pageIndex={index + 2}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
