import { mockGeneratePalette } from "../../data/dummy-data";
import type { GeneratePalettesResponse } from "../types/palette";

// Toggle between mock and production API
// Set VITE_USE_MOCK_API=false to use production API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

// Production API call
async function generatePaletteProduction(mood: string): Promise<GeneratePalettesResponse> {
  const response = await fetch("/api/generate-palette", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mood: mood.trim(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to generate palette" }));

    // For rate limit errors, use the detailed message from the API
    if (response.status === 429) {
      throw new Error(errorData.error || "Rate limit exceeded. Please try again later.");
    }

    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Main function that toggles between mock and production
export async function generatePalette(mood: string): Promise<GeneratePalettesResponse> {
  if (USE_MOCK_API) {
    console.log("🎨 Using MOCK API");
    return mockGeneratePalette(mood);
  } else {
    console.log("🚀 Using PRODUCTION API");
    return generatePaletteProduction(mood);
  }
}

// Export the flag so components can check if needed
export { USE_MOCK_API };
