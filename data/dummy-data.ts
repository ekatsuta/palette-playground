import sanzoWadaColors from "./sanzo-wada-colors.json";
import type {
  GeneratePalettesResponse,
  SanzoWadaCombination,
  PaletteWithReasoning,
} from "../src/types/palette";

export const sanzoWadaData = sanzoWadaColors as SanzoWadaCombination[];

// Mock function to simulate the API response from generate-palette.ts
export function mockGeneratePalette(mood: string): Promise<GeneratePalettesResponse> {
  return new Promise((resolve) => {
    // Simulate network delay (3-5 seconds)
    const delay = 3000 + Math.random() * 4000;

    setTimeout(() => {
      // Randomly select a palette from the actual data
      const randomIndex = Math.floor(Math.random() * sanzoWadaData.length);
      const selectedCombination = sanzoWadaData[randomIndex];

      // Create mock inspirations based on the mood
      const mockInspirations = [
        `- Monet's Water Lilies\n- Morning mist\n- Vintage postcards\n- Sea glass collection\n- Garden in spring`,
        `- Sunset at the beach\n- Warm cinnamon rolls\n- Autumn leaves\n- Van Gogh's Starry Night\n- Cozy fireside`,
        `- Japanese tea ceremony\n- Cherry blossoms\n- Soft cotton candy\n- Watercolor painting\n- Quiet morning light`,
        `- Ocean waves\n- Fresh lavender fields\n- Peacock feathers\n- Stained glass windows\n- Butterfly wings`,
      ];

      const inspirations = mockInspirations[Math.floor(Math.random() * mockInspirations.length)];

      const palette: PaletteWithReasoning = {
        ...selectedCombination,
        inspirations,
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
