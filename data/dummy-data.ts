import sanzoWadaColors from "./sanzo-wada-colors.json";
import type {
  GeneratePalettesResponse,
  SanzoWadaCombination,
  PaletteWithReasoning,
} from "../src/types/palette";

// Export the actual Sanzo Wada data
export const sanzoWadaData = sanzoWadaColors as SanzoWadaCombination[];

// Mock function to simulate the API response from generate-palette.ts
export function mockGeneratePalette(mood: string): Promise<GeneratePalettesResponse> {
  return new Promise((resolve) => {
    // Simulate network delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;

    setTimeout(() => {
      // Randomly select a palette from the actual data
      const randomIndex = Math.floor(Math.random() * sanzoWadaData.length);
      const selectedCombination = sanzoWadaData[randomIndex];

      // Create a mock reasoning based on the mood
      const mockReasonings = [
        `This palette captures the essence of "${mood}" through its harmonious blend of colors that evoke both warmth and depth.`,
        `The color combination perfectly embodies "${mood}" with its balanced interplay of light and shadow tones.`,
        `Selected for its emotional resonance with "${mood}", this palette creates a cohesive visual narrative.`,
        `This palette's psychological impact aligns beautifully with the mood of "${mood}", offering both contrast and harmony.`,
      ];

      const reasoning = mockReasonings[Math.floor(Math.random() * mockReasonings.length)];

      const palette: PaletteWithReasoning = {
        ...selectedCombination,
        reasoning,
      };

      const response: GeneratePalettesResponse = {
        mood: mood.trim(),
        palette,
        timestamp: new Date().toISOString(),
      };

      resolve(response);
    }, delay);
  });
}
