import { useState } from "react";

export function usePagination(totalPages: number) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));
  const goPrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const reset = () => setCurrentIndex(0);

  return {
    currentIndex,
    goNext,
    goPrevious,
    reset,
    hasNext: currentIndex < totalPages - 1,
    hasPrevious: currentIndex > 0,
  };
}
