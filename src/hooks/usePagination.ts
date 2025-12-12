import { useState } from "react";

export interface Pagination {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  reset: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function usePagination(totalPages: number): Pagination {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex((prev) => Math.min(totalPages - 1, prev + 1));
  const goPrevious = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const reset = () => setCurrentIndex(0);

  return {
    currentIndex,
    setCurrentIndex,
    goNext,
    goPrevious,
    reset,
    hasNext: currentIndex < totalPages - 1,
    hasPrevious: currentIndex > 0,
  };
}
