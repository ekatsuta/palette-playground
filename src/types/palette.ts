export interface SanzoWadaColor {
  name: string;
  hex: string;
}

export interface SanzoWadaCombination {
  id: number;
  colors: SanzoWadaColor[];
}

export interface SanzoWadaData {
  metadata: {
    source: string;
    exported_at: string;
    total_combinations: number;
    version: string;
    detailed: boolean;
  };
  combinations: SanzoWadaCombination[];
}

// For the API response (includes reasoning from LLM)
export interface PaletteWithReasoning extends SanzoWadaCombination {
  reasoning: string;
}

// API Request type
export interface GeneratePalettesRequest {
  mood: string;
  conversationHistory?: ConversationMessage[];
  currentPalettes?: PaletteWithReasoning[];
}

// API Response type
export interface GeneratePalettesResponse {
  mood: string;
  palettes: PaletteWithReasoning[];
  count: number;
  timestamp: string;
}

// Conversation types
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string | PaletteWithReasoning[];
  timestamp?: number;
}

// Error response type
export interface APIError {
  error: string;
  message?: string;
  details?: string;
}
