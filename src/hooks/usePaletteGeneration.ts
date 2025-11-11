import { useState } from "react";
import { PaletteWithReasoning } from "@/types/palette";
import { generatePalette } from "../utils/api";

export function usePaletteGeneration() {
  const [palette, setPalette] = useState<PaletteWithReasoning | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (mood: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generatePalette(mood);
      setPalette(response.palette);
      return response.palette;
    } catch (err) {
      let message = "Oops! We couldn't generate that palette. Please try again.";

      if (err instanceof Error) {
        // If it's a rate limit error, use the detailed message from the API
        if (err.message.includes("429") || err.message.toLowerCase().includes("limit")) {
          message = err.message; // Use the full rate limit message from API
        } else if (err.message.includes("network") || err.message.includes("Failed to fetch")) {
          message = "Connection issue. Please check your internet and try again.";
        } else if (err.message.includes("500")) {
          message = "Our AI is taking a break. Please try again in a moment.";
        } else if (err.message.toLowerCase().includes("api")) {
          message =
            "Something went wrong on our end. Please try a different mood or try again later.";
        }
      }

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { palette, setPalette, isLoading, error, generate };
}
