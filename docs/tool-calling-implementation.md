# Tool Calling Implementation Guide

## Problem Statement

Currently, the API uses free-form JSON responses from Claude, which requires complex parsing logic to handle various response formats. This approach has reliability issues:

**The "Verbose Response" Bug**

Claude sometimes returns valid JSON followed by additional explanatory text:

```
{
  "id": 250,
  "reasoning": "The Sanzo Wada palette #250..."
}

The reasoning highlights the connection between the colors...
```

This causes JSON parsing to fail, resulting in 500 errors for users. Our current solution uses multiple fallback parsing strategies (markdown code blocks, regex extraction, raw parsing), which adds ~30 lines of error-prone code.

## How Tool Calling Solves This

Claude's tool calling feature provides **guaranteed structured output**:

- Claude returns data in a predictable `tool_use` content block
- No extra text or explanations outside the structured format
- No parsing needed - direct access to typed JSON
- Built-in validation against your schema

Instead of asking Claude to "return JSON", you define a tool schema and Claude automatically formats its response to match.

## Benefits

### 1. **Reliability** (Primary Goal)

- ✅ Eliminates the verbose response bug permanently
- ✅ No more JSON parsing edge cases or failures
- ✅ Guaranteed to match your schema or fail gracefully

### 2. **Simpler Code**

- ✅ Removes ~30 lines of parsing logic
- ✅ No regex patterns or fallback strategies needed
- ✅ Cleaner error handling

### 3. **Cost Savings** (Bonus)

- ✅ ~7% reduction in costs ($0.45/month savings)
- ✅ Shorter prompts (no need to explain JSON format)
- ✅ More deterministic token usage

### 4. **Better Developer Experience**

- ✅ Type-safe responses
- ✅ Schema-validated output
- ✅ Easier to debug and maintain

## Implementation Steps

### Step 1: Define the Tool Schema

Add a tool definition to your API call:

```typescript
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
```

### Step 2: Update System Prompt

Remove JSON formatting instructions from the system prompt since tool calling handles this automatically:

**Before:**

```typescript
const userPrompt = `Please analyze this mood/inspiration and select exactly 1 color combination.

Return your response as a JSON object with this exact structure:
{
  "id": 1,
  "reasoning": "Brief 1-2 sentence explanation..."
}`;
```

**After:**

```typescript
const userPrompt = `Please analyze this mood/inspiration and select exactly 1 color combination that best captures its essence.

Use the select_palette tool to return your selection with reasoning that helps the artist understand your color theory logic.`;
```

### Step 3: Update API Call

Add the `tools` and `tool_choice` parameters:

```typescript
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
  tool_choice: { type: "tool", name: "select_palette" }, // Force tool usage
});
```

### Step 4: Update Response Handling

Replace the entire JSON parsing section with simple tool extraction:

**Before (~40 lines):**

````typescript
const responseText = message.content
  .filter((b: any) => b.type === "text")
  .map((b: any) => b.text)
  .join("\n");

if (!responseText) {
  throw new Error("No text content in model response");
}

let llmResponse: LLMResponse;
try {
  let jsonString: string;

  // Strategy 1: Try to extract JSON from markdown code blocks
  const markdownMatch =
    responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);

  if (markdownMatch) {
    jsonString = markdownMatch[1].trim();
  } else {
    // Strategy 2: Extract just the first JSON object
    const objectMatch = responseText.match(/\{[\s\S]*?\}/);
    if (objectMatch) {
      jsonString = objectMatch[0];
    } else {
      // Strategy 3: Last resort - try parsing entire response
      jsonString = responseText.trim();
    }
  }

  llmResponse = JSON.parse(jsonString);
} catch (parseError) {
  console.error("Failed to parse LLM response:", responseText);
  console.error("Parse error:", parseError);
  return res.status(500).json({
    error: "Failed to parse AI response",
    details: process.env.NODE_ENV === "development" ? responseText : undefined,
  });
}

if (!llmResponse.id || typeof llmResponse.id !== "number") {
  return res.status(500).json({ error: "Invalid AI response format" });
}
````

**After (~10 lines):**

```typescript
// Find the tool use content block
const toolUse = message.content.find(
  (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
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
```

### Step 5: Update Types (Optional but Recommended)

Add proper TypeScript types for better type safety:

```typescript
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";

interface LLMResponse {
  id: number;
  reasoning: string;
}
```

### Step 6: Remove Unused Code

Delete the JSON parsing helper functions and regex patterns since they're no longer needed.

## Complete Code Example

Here's the full updated `generate-palette.ts` with tool calling:

```typescript
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
- Practical application: How might these colors translate to different artistic mediums?`;

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
```

## Testing Plan

### 1. **Local Testing**

Test various mood inputs to ensure tool calling works:

```bash
# Test single-word moods (previously caused bugs)
curl -X POST http://localhost:3000/api/generate-palette \
  -H "Content-Type: application/json" \
  -d '{"mood": "sky"}'

# Test complex descriptions
curl -X POST http://localhost:3000/api/generate-palette \
  -H "Content-Type: application/json" \
  -d '{"mood": "a melancholic autumn afternoon with rain"}'

# Test with conversation history
curl -X POST http://localhost:3000/api/generate-palette \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "make it more vibrant",
    "conversationHistory": [...],
    "currentPalette": {...}
  }'
```

### 2. **Verify Response Format**

Check that responses contain `tool_use` blocks:

```typescript
console.log("Response content:", message.content);
// Should show:
// [
//   {
//     type: "tool_use",
//     id: "toolu_...",
//     name: "select_palette",
//     input: { id: 250, reasoning: "..." }
//   }
// ]
```

### 3. **Test Edge Cases**

- Empty mood string
- Very long mood (>500 chars)
- Rate limiting scenarios
- Network errors
- Invalid API keys

### 4. **Monitor Logs**

After deployment, monitor for:

- ✅ Cache hits/misses still working
- ✅ No "Failed to parse AI response" errors
- ✅ Response times remain fast
- ✅ Token usage similar or lower

### 5. **A/B Testing** (Optional)

If you want to be extra safe, you could:

1. Deploy tool calling to a staging environment
2. Run both versions side-by-side
3. Compare reliability metrics over a few days
4. Roll out to production once confident

## Rollback Plan

If something goes wrong after deployment:

1. **Quick rollback**: Revert the git commit and redeploy
2. **The old parsing logic is preserved in git history** at commit before this change
3. No data loss since this only affects the API endpoint logic

## Expected Outcomes

After implementing tool calling:

✅ **Zero** "Failed to parse AI response" errors
✅ **~30 fewer lines** of parsing code to maintain
✅ **~7% cost reduction** ($0.45/month savings)
✅ **More predictable** response format
✅ **Better developer experience** with type safety

## Additional Resources

- [Anthropic Tool Use Documentation](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [TypeScript SDK Tool Use Examples](https://github.com/anthropics/anthropic-sdk-typescript#tools)
- [Best Practices for Tool Calling](https://docs.anthropic.com/en/docs/build-with-claude/tool-use#best-practices-for-tool-definitions)

## Questions?

If you encounter issues during implementation:

1. Check that `tool_choice` forces the tool to be used
2. Verify the schema matches your `LLMResponse` interface
3. Look at the full `message.content` array in logs
4. Ensure you're type-checking the `ToolUseBlock` correctly
