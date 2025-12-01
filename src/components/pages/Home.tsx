import { useState, useEffect } from "react";
import { compositions } from "./SingleCompositionPage";
import { usePagination } from "../../hooks/usePagination";
import { usePaletteGeneration } from "../../hooks/usePaletteGeneration";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import PageHeader from "../layout/PageHeader";
import MainContent from "../layout/MainContent";
import { parseShareUrl, loadPaletteById, clearShareParams } from "../../utils/share";
import styles from "../../App.module.css";

export function Home() {
  const [mood, setMood] = useState("");
  const [submittedMood, setSubmittedMood] = useState("");

  const { palette, setPalette, isLoading, error, generate } = usePaletteGeneration();
  const { currentIndex, setCurrentIndex, goNext, goPrevious, reset, hasNext, hasPrevious } =
    usePagination(compositions.length + 2); // Summary + Reasoning + Compositions

  // Scroll to top smoothly on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle shared palette URLs on mount
  useEffect(() => {
    const shareData = parseShareUrl();
    if (shareData) {
      const sharedPalette = loadPaletteById(shareData.paletteId);
      if (sharedPalette) {
        setPalette(sharedPalette);
        setSubmittedMood(shareData.mood);
        setCurrentIndex(shareData.pageIndex);
        clearShareParams();
      }
    }
  }, []);

  const handleSubmit = async (mood: string) => {
    setSubmittedMood(mood);
    reset();
    await generate(mood);
  };

  const handleReset = () => {
    setPalette(null);
    setMood("");
    setSubmittedMood("");
    reset();
  };

  // Keyboard navigation - only enabled when palette is shown
  useKeyboardNavigation(
    {
      onArrowLeft: hasPrevious ? goPrevious : undefined,
      onArrowRight: hasNext ? goNext : undefined,
    },
    { enabled: !!palette }
  );

  const showHeader = palette !== null || isLoading;

  return (
    <div className={styles.appContainer}>
      {showHeader && (
        <PageHeader onSubmit={handleSubmit} isLoading={isLoading} onReset={handleReset} />
      )}
      <MainContent
        isLoading={isLoading}
        error={error}
        palette={palette}
        mood={mood}
        setMood={setMood}
        submittedMood={submittedMood}
        currentIndex={currentIndex}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onNext={goNext}
        onPrevious={goPrevious}
        onSubmit={handleSubmit}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}
