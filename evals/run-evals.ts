import Anthropic from "@anthropic-ai/sdk";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import sanzoWadaData from "../data/sanzo-wada-colors.json";
import type { PaletteWithReasoning, SanzoWadaData } from "../src/types/palette";
import { testCases } from "./test-cases";
import type { EvalResult, EvalSummary } from "./types";
import { judgeWithLLM, validateFormat } from "./validators";

// Load environment variables
dotenv.config();

const typedSanzoWadaData = sanzoWadaData as SanzoWadaData;

// System prompt (same as production)
const SYSTEM_PROMPT = `You are an expert in color theory, art history, and the psychology of color. You have deep knowledge of the Sanzo Wada Dictionary of Color Combinations, a legendary 1933 reference work by Japanese artist Sanzo Wada that contains 348 carefully curated color palettes that capture Japanese perceptions of color.
Your role is to interpret artists' emotional and conceptual descriptions and select the most appropriate color combination from the Sanzo Wada dictionary that will inspire their creative work.

When selecting a palette, consider:
- Emotional resonance: How do these colors evoke the described feeling?
- Cultural associations: What meanings do these colors carry across different cultures?
- Psychological impact: How do these colors affect mood and perception?
- Harmony and balance: How do the colors work together as a cohesive palette?
- Practical application: How might these colors translate to different artistic mediums (painting, digital art, collage, etc.)?

You should select the single best combination that captures the essence of the artist's inspiration. Then, provide a playful list of 3-5 SHORT, specific things (1-5 words each) that share the same colors or feelings - these could be famous artworks, natural scenes, places, objects, foods, seasons, or cultural references that would further inspire the artist. Keep each item brief and punchy!`;

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
        inspirations: {
          type: "string",
          description:
            "A playful, bullet-pointed list of 3-5 specific inspirations that share these colors or evoke similar feelings. IMPORTANT: Keep each item SHORT and concise - just 1-5 words maximum! Examples: '- Monet's Water Lilies', '- Rhode Island sunset', '- Kyoto tea house', '- Vintage teacups', '- Honeydew and mint'. Make it fun and evocative for artists of all ages! Format as a markdown list with each item on its own line starting with '- '.",
        },
      },
      required: ["id", "inspirations"],
    },
  },
];

/**
 * Generate a palette using the production API logic
 */
async function generatePalette(mood: string, anthropic: Anthropic): Promise<PaletteWithReasoning> {
  const colorDictionaryText = `Available color combinations from the Sanzo Wada Dictionary (348 total):
${JSON.stringify(typedSanzoWadaData)}`;

  const userPrompt = `An artist describes their creative inspiration as: "${mood.trim()}"

This is a new request for a color palette suggestion.

Please analyze this mood/inspiration and select exactly 1 color combination that best captures its essence. Use the select_palette tool to return your selection with a playful list of 3-5 SHORT inspirations (1-5 words each) - artworks, places, objects, natural scenes, etc. - that share these colors or evoke similar feelings. Keep it concise, fun, and inspiring for artists of all ages!`;

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

  // Extract tool use from response
  const toolUse = message.content.find((block): block is ToolUseBlock => block.type === "tool_use");

  if (!toolUse || toolUse.name !== "select_palette") {
    throw new Error("No tool use in response");
  }

  const llmResponse = toolUse.input as { id: number; inspirations: string };

  // Find the selected palette
  const combination = typedSanzoWadaData.find((c) => c.id === llmResponse.id);

  if (!combination) {
    throw new Error(`Combination ${llmResponse.id} not found`);
  }

  return {
    id: combination.id,
    colors: combination.colors,
    inspirations: llmResponse.inspirations,
  };
}

/**
 * Run evaluation on a single test case
 */
async function runEval(
  testCase: { id: string; mood: string },
  anthropic: Anthropic,
  apiKey: string
): Promise<EvalResult> {
  console.log(`\n📝 Running test: ${testCase.id} - "${testCase.mood}"`);

  // Generate palette
  const palette = await generatePalette(testCase.mood, anthropic);
  console.log(`   Generated palette #${palette.id}`);
  console.log(`   Inspirations: ${palette.inspirations.replace(/\n/g, " ")}`);

  // Rule-based validation
  const ruleBasedChecks = validateFormat(palette.inspirations);
  console.log(`   Rule-based: ${ruleBasedChecks.passed ? "✅ PASS" : "❌ FAIL"}`);

  // LLM judge evaluation
  console.log(`   Running LLM judge...`);
  const llmJudgement = await judgeWithLLM(testCase.mood, palette, apiKey);
  console.log(
    `   LLM Judge: ${llmJudgement.passed ? "✅ PASS" : "❌ FAIL"} (score: ${llmJudgement.overallScore.toFixed(2)}/5)`
  );

  const overallPass = ruleBasedChecks.passed && llmJudgement.passed;

  return {
    testCaseId: testCase.id,
    mood: testCase.mood,
    variantId: "current-production",
    palette,
    ruleBasedChecks,
    llmJudgement,
    overallPass,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main eval runner
 */
async function main() {
  console.log("🚀 Starting Palette Generation Evals\n");
  console.log(`Running ${testCases.length} test cases...\n`);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not found in environment variables");
  }

  const anthropic = new Anthropic({ apiKey });

  const results: EvalResult[] = [];

  // Run evals sequentially to avoid rate limits
  for (const testCase of testCases) {
    try {
      const result = await runEval(testCase, anthropic, apiKey);
      results.push(result);

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Continue with next test case
    }
  }

  // Generate summary
  const summary: EvalSummary = {
    totalTests: results.length,
    passed: results.filter((r) => r.overallPass).length,
    failed: results.filter((r) => !r.overallPass).length,
    ruleBasedPassRate: results.filter((r) => r.ruleBasedChecks.passed).length / results.length,
    llmJudgePassRate: results.filter((r) => r.llmJudgement.passed).length / results.length,
    averageRelevanceScore:
      results.reduce((sum, r) => sum + r.llmJudgement.relevanceScore, 0) / results.length,
    averageCreativityScore:
      results.reduce((sum, r) => sum + r.llmJudgement.creativityScore, 0) / results.length,
    averageVarietyScore:
      results.reduce((sum, r) => sum + r.llmJudgement.varietyScore, 0) / results.length,
    results,
  };

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 EVALUATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`\nTotal Tests: ${summary.totalTests}`);
  console.log(
    `Passed: ${summary.passed} (${((summary.passed / summary.totalTests) * 100).toFixed(1)}%)`
  );
  console.log(
    `Failed: ${summary.failed} (${((summary.failed / summary.totalTests) * 100).toFixed(1)}%)`
  );
  console.log(`\nRule-Based Pass Rate: ${(summary.ruleBasedPassRate * 100).toFixed(1)}%`);
  console.log(`LLM Judge Pass Rate: ${(summary.llmJudgePassRate * 100).toFixed(1)}%`);
  console.log(`\nAverage Scores (out of 5):`);
  console.log(`  Relevance:  ${summary.averageRelevanceScore.toFixed(2)}`);
  console.log(`  Creativity: ${summary.averageCreativityScore.toFixed(2)}`);
  console.log(`  Variety:    ${summary.averageVarietyScore.toFixed(2)}`);

  // Show failures
  const failures = results.filter((r) => !r.overallPass);
  if (failures.length > 0) {
    console.log(`\n${"=".repeat(60)}`);
    console.log("❌ FAILED TESTS");
    console.log("=".repeat(60));
    failures.forEach((result) => {
      console.log(`\n${result.testCaseId}: "${result.mood}"`);
      if (!result.ruleBasedChecks.passed) {
        console.log("  Rule-based failures:");
        result.ruleBasedChecks.details.forEach((detail) => {
          if (detail.startsWith("❌")) {
            console.log(`    ${detail}`);
          }
        });
      }
      if (!result.llmJudgement.passed) {
        console.log(
          `  LLM Judge score: ${result.llmJudgement.overallScore.toFixed(2)}/5 (threshold: 3.5)`
        );
        console.log(`    Relevance:  ${result.llmJudgement.relevanceScore}/5`);
        console.log(`    Creativity: ${result.llmJudgement.creativityScore}/5`);
        console.log(`    Variety:    ${result.llmJudgement.varietyScore}/5`);
      }
    });
  }

  // Save detailed results to file
  const resultsDir = path.join(__dirname, "../eval-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(resultsDir, `eval-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));

  console.log(`\n📁 Detailed results saved to: ${resultsFile}`);
  console.log("\n✅ Evaluation complete!\n");
}

// Run the evals
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
