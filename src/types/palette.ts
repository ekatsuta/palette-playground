export interface SanzoWadaColor {
  name: string;
  hex: string;
}

export interface SanzoWadaCombination {
  id: number;
  colors: SanzoWadaColor[];
}

export type SanzoWadaData = SanzoWadaCombination[];

export interface PaletteWithReasoning extends SanzoWadaCombination {
  reasoning: string;
}

// API Request type
export interface GeneratePalettesRequest {
  mood: string;
  conversationHistory?: ConversationMessage[];
  currentPalette?: PaletteWithReasoning;
}

// API Response type
export interface GeneratePalettesResponse {
  mood: string;
  palette: PaletteWithReasoning;
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
