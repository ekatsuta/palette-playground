import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import sanzoWadaData from "../data/sanzo-wada-colors.json" with { type: "json" };
import type { GeneratePalettesRequest, SanzoWadaData } from "../src/types/palette";
import { checkRateLimit, getRateLimitMessage } from "./rate-limiter";

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

const tools: Anthropic.Tool[] = [
  {
    name: "select_palette",
    description:
      "Select a color palette from the Sanzo Wada Dictionary that matches the artist's inspiration",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the selected palette from the Sanzo Wada Dictionary (1-348)",
        },
        reasoning: {
          type: "string",
          description:
            "Brief 1-2 sentence explanation of why this palette fits the mood, focusing on color theory and emotional resonance",
        },
      },
      required: ["id", "reasoning"],
    },
  },
];

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

  // Check rate limits
  const rateLimitResult = checkRateLimit(req);

  // Add rate limit headers to response
  res.setHeader("X-RateLimit-Hourly-Remaining", rateLimitResult.hourlyRemaining.toString());
  res.setHeader("X-RateLimit-Daily-Remaining", rateLimitResult.dailyRemaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(rateLimitResult.resetTime).toISOString());

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: getRateLimitMessage(rateLimitResult),
      hourlyRemaining: rateLimitResult.hourlyRemaining,
      dailyRemaining: rateLimitResult.dailyRemaining,
      resetTime: rateLimitResult.resetTime,
      resetMinutes: rateLimitResult.resetMinutes,
    });
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

    // Separate static content (cacheable) from dynamic content
    const colorDictionaryText = `Available color combinations from the Sanzo Wada Dictionary (348 total):
${JSON.stringify(typedSanzoWadaData)}`;

    const userPrompt = `${contextPrompt}An artist describes their creative inspiration as: "${mood.trim()}"

${
  conversationHistory && conversationHistory.length > 0
    ? 'This is a follow-up request. Consider the previous context and refine the palette suggestion accordingly. If they ask to modify the current palette (e.g., "make it more vibrant"), adjust your selection based on the currently displayed palette.'
    : "This is a new request for a color palette suggestion."
}

Please analyze this mood/inspiration and select exactly 1 color combination that best captures its essence. Use the select_palette tool to return your selection with reasoning that helps the artist understand your color theory logic.`;

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
      tools: tools,
      tool_choice: { type: "tool", name: "select_palette" },
    });

    // Log cache performance (Remove once performance verified)
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

    // Extract tool use from response
    const toolUse = message.content.find(
      (block): block is ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse || toolUse.name !== "select_palette") {
      console.error("No tool use in response:", message.content);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const llmResponse = toolUse.input as LLMResponse;

    // Validate the response
    if (!llmResponse.id || typeof llmResponse.id !== "number") {
      return res.status(500).json({ error: "Invalid palette ID in response" });
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
