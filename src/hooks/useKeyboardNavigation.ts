// hooks/useKeyboardNavigation.ts
import { useEffect } from "react";

interface KeyboardNavigationHandlers {
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEscape?: () => void;
}

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  ignoreWhenTyping?: boolean;
}

export function useKeyboardNavigation(
  handlers: KeyboardNavigationHandlers,
  options: UseKeyboardNavigationOptions = {}
) {
  const { enabled = true, ignoreWhenTyping = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (ignoreWhenTyping) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault(); // Prevent default scroll behavior
          handlers.onArrowLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          handlers.onArrowRight?.();
          break;
        case "Escape":
          handlers.onEscape?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, ignoreWhenTyping, handlers]);
}
