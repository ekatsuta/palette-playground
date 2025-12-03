import { useEffect } from "react";

interface UseScrollKeyboardNavProps {
  enabled: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function useScrollKeyboardNav({
  enabled,
  hasNext,
  hasPrevious,
  currentIndex,
  onNavigate,
}: UseScrollKeyboardNavProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && hasNext) {
        e.preventDefault();
        onNavigate(currentIndex + 1);
      } else if (e.key === "ArrowUp" && hasPrevious) {
        e.preventDefault();
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNavigate(currentIndex + 1);
      } else if (e.key === "ArrowLeft" && hasPrevious) {
        e.preventDefault();
        onNavigate(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, hasNext, hasPrevious, currentIndex, onNavigate]);
}
