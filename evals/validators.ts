import Anthropic from "@anthropic-ai/sdk";
import type { PaletteWithReasoning } from "../src/types/palette";
import type { RuleBasedCheckResults, LLMJudgementResults } from "./types";

/**
 * Rule-based validation for format compliance
 * Checks structure, bullet count, and word count per bullet
 */
export function validateFormat(inspirations: string): RuleBasedCheckResults {
  const details: string[] = [];

  // Split by newlines and filter empty lines
  const lines = inspirations.split("\n").filter((line) => line.trim().length > 0);

  // Check if all lines start with "- "
  const allStartWithBullet = lines.every((line) => line.trim().startsWith("- "));
  if (!allStartWithBullet) {
    details.push("❌ Not all lines start with '- '");
  } else {
    details.push("✓ All lines properly formatted with bullets");
  }

  // Count bullets
  const bulletCount = lines.length;
  const bulletCountInRange = bulletCount >= 3 && bulletCount <= 5;
  if (!bulletCountInRange) {
    details.push(`❌ Bullet count (${bulletCount}) not in range 3-5`);
  } else {
    details.push(`✓ Bullet count (${bulletCount}) is correct`);
  }

  // Check word count for each bullet
  const wordCounts = lines.map((line) => {
    const text = line.replace(/^-\s*/, "").trim();
    return text.split(/\s+/).length;
  });

  const allBulletsShort = wordCounts.every((count) => count >= 1 && count <= 5);
  if (!allBulletsShort) {
    details.push(`❌ Some bullets have incorrect word count: [${wordCounts.join(", ")}]`);
    wordCounts.forEach((count, idx) => {
      if (count < 1 || count > 5) {
        details.push(`  • Bullet ${idx + 1}: ${count} words (should be 1-5)`);
      }
    });
  } else {
    details.push(`✓ All bullets have 1-5 words: [${wordCounts.join(", ")}]`);
  }

  const passed = allStartWithBullet && bulletCountInRange && allBulletsShort;

  return {
    hasCorrectFormat: allStartWithBullet,
    bulletCount,
    bulletCountInRange,
    wordCounts,
    allBulletsShort,
    details,
    passed,
  };
}

/**
 * LLM-as-judge evaluation for creativity, variety, and relevance
 * Uses Claude to score the inspirations on subjective criteria
 */
export async function judgeWithLLM(
  mood: string,
  palette: PaletteWithReasoning,
  anthropicApiKey: string
): Promise<LLMJudgementResults> {
  const anthropic = new Anthropic({ apiKey: anthropicApiKey });

  const judgePrompt = `You are evaluating AI-generated color palette inspirations for quality.

USER MOOD/PROMPT: "${mood}"

SELECTED PALETTE ID: ${palette.id}
COLORS: ${palette.colors.map((c) => `${c.name} (${c.hex})`).join(", ")}

GENERATED INSPIRATIONS:
${palette.inspirations}

Please evaluate the inspirations on three criteria, scoring each from 1-5:

1. RELEVANCE (1-5): Do the inspirations actually relate to the mood "${mood}"? Are they coherent and connected to the theme?
   - 5: Perfectly captures the mood, all inspirations are highly relevant
   - 3: Somewhat relevant, most inspirations connect to the mood
   - 1: Not relevant, inspirations don't match the mood

2. CREATIVITY (1-5): Are the inspirations interesting, imaginative, and specific?
   - 5: Highly creative and specific (e.g., "Monet's Water Lilies", "Rhode Island sunset")
   - 3: Somewhat creative but generic (e.g., "blue ocean", "sunset colors")
   - 1: Very generic or boring (e.g., "blue", "colors")

3. VARIETY (1-5): Do the inspirations show diverse types of references (art, nature, objects, places, etc.)?
   - 5: Great variety across different categories (art + nature + objects + places)
   - 3: Some variety, but mostly from one category
   - 1: All inspirations are the same type

Also consider: Are the inspirations appropriate for all ages including children?

Respond with a JSON object in this exact format:
{
  "relevanceScore": <number 1-5>,
  "relevanceReasoning": "<brief explanation>",
  "creativityScore": <number 1-5>,
  "creativityReasoning": "<brief explanation>",
  "varietyScore": <number 1-5>,
  "varietyReasoning": "<brief explanation>"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: judgePrompt }],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from judge LLM");
    }

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in judge response");
    }

    const judgment = JSON.parse(jsonMatch[0]);

    const overallScore =
      (judgment.relevanceScore + judgment.creativityScore + judgment.varietyScore) / 3;

    // Consider passing if average score >= 3.5
    const passed = overallScore >= 3.5;

    return {
      relevanceScore: judgment.relevanceScore,
      relevanceReasoning: judgment.relevanceReasoning,
      creativityScore: judgment.creativityScore,
      creativityReasoning: judgment.creativityReasoning,
      varietyScore: judgment.varietyScore,
      varietyReasoning: judgment.varietyReasoning,
      overallScore,
      passed,
    };
  } catch (error) {
    console.error("Error in LLM judge:", error);
    // Return failed result on error
    return {
      relevanceScore: 0,
      relevanceReasoning: `Error during evaluation: ${error instanceof Error ? error.message : "Unknown error"}`,
      creativityScore: 0,
      creativityReasoning: "N/A - evaluation failed",
      varietyScore: 0,
      varietyReasoning: "N/A - evaluation failed",
      overallScore: 0,
      passed: false,
    };
  }
}
