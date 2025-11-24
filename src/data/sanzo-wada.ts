import sanzoWadaColors from "../../data/sanzo-wada-colors.json";
import type { SanzoWadaCombination } from "../types/palette";

interface SanzoWadaDataStructure {
  combinations: Array<SanzoWadaCombination & { name?: string }>;
}

// Curated mood-to-palette mappings for the rotating showcase
// Each mood is paired with a specific palette ID that matches its feeling
export const moodPaletteMappings = [
  { mood: "The quiet melancholy of rain on autumn leaves", paletteId: 131 },
  { mood: "Electric excitement and urban energy at night", paletteId: 154 },
  { mood: "Warm comfort of a sunlit afternoon", paletteId: 138 },
  { mood: "Cool serenity of a misty morning", paletteId: 143 },
  { mood: "Birthday cake frosting", paletteId: 153 },
  { mood: "Cozy night by the fireplace", paletteId: 152 },
  { mood: "Fresh morning dew on spring flowers", paletteId: 150 },
  { mood: "Golden hour at the beach", paletteId: 151 },
  { mood: "Vibrant energy of a busy marketplace", paletteId: 122 },
  { mood: "Peaceful tranquility of a library", paletteId: 139 },
  { mood: "Nostalgic warmth of childhood memories", paletteId: 123 },
  { mood: "Modern minimalist sophistication", paletteId: 140 },
];

// Transform the JSON data into the expected structure
// Filter to only include palettes with 3-5 colors for better visual display
export const sanzoWadaData: SanzoWadaDataStructure = {
  combinations: sanzoWadaColors
    .filter((combination) => combination.colors.length >= 3 && combination.colors.length <= 5)
    .map((combination) => ({
      ...combination,
      name: combination.colors.map((c) => c.name).join(" + "),
    })),
};
