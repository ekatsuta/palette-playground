import type { PaletteWithReasoning } from "../types/palette";
import sanzoWadaData from "../../data/sanzo-wada-colors.json";

interface ShareData {
  paletteId: number;
  pageIndex: number;
  mood: string;
}

/**
 * Generate a shareable URL for the current palette and page
 */
export function generateShareUrl(paletteId: number, pageIndex: number, mood: string): string {
  const url = new URL(window.location.origin);
  url.searchParams.set("palette", paletteId.toString());
  url.searchParams.set("page", pageIndex.toString());
  url.searchParams.set("mood", mood);
  return url.toString();
}

/**
 * Parse share data from URL parameters
 */
export function parseShareUrl(): ShareData | null {
  const params = new URLSearchParams(window.location.search);
  const paletteId = params.get("palette");
  const pageIndex = params.get("page");
  const mood = params.get("mood");

  if (!paletteId || !pageIndex || !mood) {
    return null;
  }

  const parsedPaletteId = parseInt(paletteId, 10);
  const parsedPageIndex = parseInt(pageIndex, 10);

  if (isNaN(parsedPaletteId) || isNaN(parsedPageIndex)) {
    return null;
  }

  return {
    paletteId: parsedPaletteId,
    pageIndex: parsedPageIndex,
    mood,
  };
}

/**
 * Load palette data by ID from the Sanzo Wada dictionary
 */
export function loadPaletteById(paletteId: number): PaletteWithReasoning | null {
  const combination = sanzoWadaData.find((c) => c.id === paletteId);

  if (!combination) {
    return null;
  }

  return {
    ...combination,
    reasoning: "Shared palette from Sanzo Wada Dictionary of Color Combinations",
  };
}

/**
 * Share URL using native share API or copy to clipboard as fallback
 */
export async function shareUrl(url: string, title: string, text: string): Promise<boolean> {
  // Try native share API first (mainly mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      // User cancelled or error occurred
      if ((err as Error).name === "AbortError") {
        // User cancelled - this is not an error
        return false;
      }
      // Fall through to clipboard
      console.warn("Native share failed, falling back to clipboard:", err);
    }
  }

  // Fallback to clipboard
  return copyToClipboard(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("Failed to copy to clipboard:", fallbackErr);
      return false;
    }
  }
}

/**
 * Clear share parameters from URL without page reload
 */
export function clearShareParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("palette");
  url.searchParams.delete("page");
  url.searchParams.delete("mood");
  window.history.replaceState({}, "", url.toString());
}
