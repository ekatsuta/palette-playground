import { useState, useEffect } from "react";
import { compositions } from "./SingleCompositionPage";
import { usePagination } from "../../hooks/usePagination";
import { usePaletteGeneration } from "../../hooks/usePaletteGeneration";
import PageHeader from "../layout/PageHeader";
import MainContent from "../layout/MainContent";
import { PaletteEditor } from "../ui/PaletteEditor";
import { parseShareUrl, loadPaletteById, clearShareParams } from "../../utils/share";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "../../App.module.css";

export function Home() {
  const [mood, setMood] = useState("");
  const [submittedMood, setSubmittedMood] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [originalPalette, setOriginalPalette] = useState<PaletteWithReasoning | null>(null);

  const { palette, setPalette, isLoading, error, generate } = usePaletteGeneration();
  const { currentIndex, setCurrentIndex, reset, hasNext, hasPrevious } = usePagination(
    compositions.length + 2
  ); // Summary + Reasoning + Compositions

  // Scroll to top smoothly on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle shared palette URLs on mount
  useEffect(() => {
    const shareData = parseShareUrl();
    if (shareData) {
      const sharedPalette = loadPaletteById(shareData.paletteId, shareData.inspirations);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    const generatedPalette = await generate(mood);
    // Store the original palette when first generated
    if (generatedPalette) {
      setOriginalPalette(generatedPalette);
    }
  };

  const handleReset = () => {
    setPalette(null);
    setOriginalPalette(null);
    setMood("");
    setSubmittedMood("");
    reset();
  };

  const handleEditPalette = () => {
    setIsEditorOpen(true);
  };

  const handleApplyPalette = (newPalette: PaletteWithReasoning) => {
    setPalette(newPalette);
  };

  const handleRevertPalette = () => {
    if (originalPalette) {
      setPalette(originalPalette);
    }
  };

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
        onSubmit={handleSubmit}
        setCurrentIndex={setCurrentIndex}
        onEditPalette={palette ? handleEditPalette : undefined}
        onRevertPalette={
          palette && originalPalette && palette !== originalPalette
            ? handleRevertPalette
            : undefined
        }
      />
      {isEditorOpen && palette && (
        <PaletteEditor
          currentPalette={palette}
          onClose={() => setIsEditorOpen(false)}
          onApply={handleApplyPalette}
        />
      )}
    </div>
  );
}
