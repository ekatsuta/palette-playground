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
      const message = err instanceof Error ? err.message : "Failed to generate palette";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { palette, isLoading, error, generate };
}
