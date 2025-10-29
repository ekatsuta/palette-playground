import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import sanzoWadaData from "../data/sanzo-wada-colors.json" with { type: "json" };
import type { GeneratePalettesRequest, SanzoWadaData } from "../src/types/palette";

const typedSanzoWadaData = sanzoWadaData as SanzoWadaData;

const SYSTEM_PROMPT = `You are an expert in color theory, art history, and the psychology of color. You have deep knowledge of the Sanzo Wada Dictionary of Color Combinations, a legendary 1933 reference work by Japanese artist Sanzo Wada that contains 348 carefully curated color palettes that capture Japanese perceptions of color.
Your role is to interpret artists' emotional and conceptual descriptions and select the most appropriate color combination from the Sanzo Wada dictionary that will inspire their creative work.

When selecting a palette, consider:
- Emotional resonance: How do these colors evoke the described feeling?
- Cultural associations: What meanings do these colors carry across different cultures?
- Psychological impact: How do these colors affect mood and perception?
- Harmony and balance: How do the colors work together as a cohesive palette?
- Practical application: How might these colors translate to different artistic mediums (painting, digital art, collage, etc.)?

You should select the single best combination that captures the essence of the artist's inspiration. Provide brief reasoning to help the artist understand why this palette was chosen.`;

interface LLMResponse {
  id: number;
  reasoning: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mood, conversationHistory, currentPalette } = req.body as GeneratePalettesRequest;

  // Validate input
  if (!mood || typeof mood !== "string" || mood.trim().length === 0) {
    return res.status(400).json({ error: "Mood description is required" });
  }

  if (mood.length > 500) {
    return res.status(400).json({
      error: "Mood description is too long (max 500 characters)",
    });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build context
    let contextPrompt = "";
    if (conversationHistory && conversationHistory.length > 0) {
      contextPrompt = `\nPrevious conversation context:\n${conversationHistory
        .slice(-4)
        .map((msg) => `${msg.role}: ${JSON.stringify(msg.content)}`)
        .join("\n")}\n\n`;
    }

    if (currentPalette) {
      contextPrompt += `\nCurrently displayed palette:\n${JSON.stringify(currentPalette, null, 2)}\n\n`;
    }

    // Format combinations compactly (no pretty-print for speed)
    const formattedCombinations = typedSanzoWadaData.map((combo) => ({
      id: combo.id,
      colors: combo.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
      })),
    }));

    // Separate static content (cacheable) from dynamic content
    const colorDictionaryText = `Available color combinations from the Sanzo Wada Dictionary (348 total):
${JSON.stringify(formattedCombinations)}`;

    const userPrompt = `${contextPrompt}An artist describes their creative inspiration as: "${mood.trim()}"

${
  conversationHistory && conversationHistory.length > 0
    ? 'This is a follow-up request. Consider the previous context and refine the palette suggestion accordingly. If they ask to modify the current palette (e.g., "make it more vibrant"), adjust your selection based on the currently displayed palette.'
    : "This is a new request for a color palette suggestion."
}

Please analyze this mood/inspiration and select exactly 1 color combination that best captures its essence.

Return your response as a JSON object with this exact structure:
{
  "id": 1,
  "reasoning": "Brief 1-2 sentence explanation of why this palette fits the mood"
}

The reasoning should help the artist understand your color theory reasoning.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
        },
        {
          type: "text",
          text: colorDictionaryText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    // Log cache performance
    const usage = message.usage;
    console.log("API Usage:", {
      input_tokens: usage.input_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens || 0,
      cache_read_input_tokens: usage.cache_read_input_tokens || 0,
      output_tokens: usage.output_tokens,
    });

    if (usage.cache_read_input_tokens && usage.cache_read_input_tokens > 0) {
      console.log("✅ Cache HIT - Using cached color data");
    } else if (usage.cache_creation_input_tokens && usage.cache_creation_input_tokens > 0) {
      console.log("📝 Cache MISS - Created new cache");
    }

    const responseText = message.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    if (!responseText) {
      throw new Error("No text content in model response");
    }

    let llmResponse: LLMResponse;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/);

      if (jsonMatch) {
        llmResponse = JSON.parse(jsonMatch[1]);
      } else {
        llmResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error("Failed to parse LLM response:", responseText);
      return res.status(500).json({
        error: "Failed to parse AI response",
        details: process.env.NODE_ENV === "development" ? responseText : undefined,
      });
    }

    if (!llmResponse.id || typeof llmResponse.id !== "number") {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    // Find the selected palette
    const combination = typedSanzoWadaData.find((c) => c.id === llmResponse.id);

    if (!combination) {
      return res.status(500).json({
        error: `Combination ${llmResponse.id} not found`,
      });
    }

    const palette = {
      id: combination.id,
      colors: combination.colors,
      reasoning: llmResponse.reasoning,
    };

    return res.status(200).json({
      mood: mood.trim(),
      palette,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);

    if (error instanceof Error) {
      const anthropicError = error as any;

      if (anthropicError.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }

      if (anthropicError.status >= 400 && anthropicError.status < 500) {
        return res.status(anthropicError.status).json({
          error: "AI service error",
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "An unexpected error occurred",
    });
  }
}
