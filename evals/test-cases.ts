import type { TestCase } from "./types";

/**
 * Test cases covering various moods, emotions, and themes
 * These will be used to evaluate the quality and consistency of palette generation
 */
export const testCases: TestCase[] = [
  // Nature-inspired
  {
    id: "nature-ocean",
    mood: "calm water and peace",
    description: "Classic calming ocean theme",
    expectedThemes: ["water", "ocean", "blue", "nature"],
  },
  {
    id: "nature-sunset",
    mood: "warm sunset vibes",
    description: "Warm, colorful sunset",
    expectedThemes: ["sunset", "warm", "orange", "sky"],
  },
  {
    id: "nature-forest",
    mood: "misty forest morning",
    description: "Cool, earthy forest atmosphere",
    expectedThemes: ["forest", "green", "nature", "morning"],
  },
  {
    id: "nature-spring",
    mood: "fresh spring garden",
    description: "Bright, fresh spring colors",
    expectedThemes: ["spring", "flowers", "garden", "fresh"],
  },

  // Emotions
  {
    id: "emotion-joy",
    mood: "pure joy and celebration",
    description: "Happy, energetic feeling",
    expectedThemes: ["happy", "bright", "celebration", "energy"],
  },
  {
    id: "emotion-melancholy",
    mood: "bittersweet nostalgia",
    description: "Reflective, nostalgic mood",
    expectedThemes: ["nostalgia", "memory", "vintage", "soft"],
  },
  {
    id: "emotion-cozy",
    mood: "cozy autumn afternoon",
    description: "Warm, comfortable feeling",
    expectedThemes: ["cozy", "warm", "autumn", "comfort"],
  },
  {
    id: "emotion-dreamy",
    mood: "dreamy starlit night",
    description: "Ethereal, mystical atmosphere",
    expectedThemes: ["night", "stars", "dream", "mystical"],
  },

  // Abstract concepts
  {
    id: "abstract-minimalist",
    mood: "minimalist and clean",
    description: "Simple, clean aesthetic",
    expectedThemes: ["minimal", "simple", "clean", "modern"],
  },
  {
    id: "abstract-vintage",
    mood: "1960s retro diner",
    description: "Vintage, nostalgic era",
    expectedThemes: ["vintage", "retro", "1960s", "diner"],
  },
  {
    id: "abstract-futuristic",
    mood: "futuristic neon city",
    description: "Modern, high-tech feeling",
    expectedThemes: ["futuristic", "neon", "city", "modern"],
  },

  // Kid-friendly
  {
    id: "kid-playful",
    mood: "playful playground fun",
    description: "Energetic, playful for kids",
    expectedThemes: ["playful", "fun", "playground", "colorful"],
  },
  {
    id: "kid-magical",
    mood: "magical fairy tale",
    description: "Whimsical, magical atmosphere",
    expectedThemes: ["magical", "fairy tale", "whimsical", "fantasy"],
  },
  {
    id: "kid-adventure",
    mood: "exciting treasure hunt",
    description: "Adventurous, exciting mood",
    expectedThemes: ["adventure", "exciting", "treasure", "exploration"],
  },

  // Cultural/Artistic
  {
    id: "art-impressionist",
    mood: "impressionist painting in Giverny",
    description: "Classic art movement reference",
    expectedThemes: ["impressionist", "Monet", "painting", "art"],
  },
  {
    id: "art-japanese",
    mood: "traditional Japanese tea ceremony",
    description: "Cultural aesthetic",
    expectedThemes: ["Japanese", "tea", "traditional", "calm"],
  },

  // Edge cases
  {
    id: "edge-very-short",
    mood: "sunset",
    description: "Very brief prompt (single word)",
  },
  {
    id: "edge-very-long",
    mood: "A warm summer evening at the beach with my family, watching the orange and pink clouds drift across the sky while the waves gently lap at the shore and seagulls call in the distance",
    description: "Very long descriptive prompt",
    expectedThemes: ["beach", "sunset", "warm", "family"],
  },
  {
    id: "edge-emoji",
    mood: "peaceful meditation 🧘‍♀️✨",
    description: "Prompt with emojis",
    expectedThemes: ["peaceful", "meditation", "calm"],
  },
  {
    id: "edge-abstract",
    mood: "the feeling you get when you remember a forgotten dream",
    description: "Very abstract, poetic concept",
    expectedThemes: ["dream", "memory", "ethereal"],
  },
];
