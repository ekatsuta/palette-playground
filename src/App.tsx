import { useState } from "react";
import { compositions } from "./components/pages/SingleCompositionPage";
import { usePagination } from "./hooks/usePagination";
import { usePaletteGeneration } from "./hooks/usePaletteGeneration";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import PageHeader from "./components/layout/PageHeader";
import MainContent from "./components/layout/MainContent";
import styles from "./App.module.css";

export default function App() {
  const [submittedMood, setSubmittedMood] = useState("");

  const { palette, isLoading, error, generate } = usePaletteGeneration();
  const { currentIndex, goNext, goPrevious, reset, hasNext, hasPrevious } = usePagination(
    compositions.length + 1
  );

  const handleSubmit = async (mood: string) => {
    setSubmittedMood(mood);
    reset();
    await generate(mood);
  };

  // Keyboard navigation - only enabled when palette is shown
  useKeyboardNavigation(
    {
      onArrowLeft: hasPrevious ? goPrevious : undefined,
      onArrowRight: hasNext ? goNext : undefined,
    },
    { enabled: !!palette }
  );

  return (
    <div className={styles.appContainer}>
      <PageHeader onSubmit={handleSubmit} isLoading={isLoading} />
      <MainContent
        isLoading={isLoading}
        error={error}
        palette={palette}
        submittedMood={submittedMood}
        currentIndex={currentIndex}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onNext={goNext}
        onPrevious={goPrevious}
      />
    </div>
  );
}
