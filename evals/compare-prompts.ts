import Anthropic from "@anthropic-ai/sdk";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import sanzoWadaData from "../data/sanzo-wada-colors.json";
import type { PaletteWithReasoning, SanzoWadaData } from "../src/types/palette";
import { promptVariants } from "./prompt-variants";
import { testCases } from "./test-cases";
import type { ComparisonSummary, EvalResult, PromptVariant, VariantStats } from "./types";
import { judgeWithLLM, validateFormat } from "./validators";

// Load environment variables
dotenv.config();

const typedSanzoWadaData = sanzoWadaData as SanzoWadaData;

const tools: Anthropic.Tool[] = [
  {
    name: "select_palette",
    description: "Will be replaced by variant-specific description",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The ID of the selected palette from the Sanzo Wada Dictionary (1-348)",
        },
        inspirations: {
          type: "string",
          description: "Will be replaced by variant-specific description",
        },
      },
      required: ["id", "inspirations"],
    },
  },
];

/**
 * Generate a palette using a specific prompt variant
 */
async function generatePalette(
  mood: string,
  variant: PromptVariant,
  anthropic: Anthropic
): Promise<PaletteWithReasoning> {
  const colorDictionaryText = `Available color combinations from the Sanzo Wada Dictionary (348 total):
${JSON.stringify(typedSanzoWadaData)}`;

  const userPrompt = `An artist describes their creative inspiration as: "${mood.trim()}"

This is a new request for a color palette suggestion.

Please analyze this mood/inspiration and select exactly 1 color combination that best captures its essence. Use the select_palette tool to return your selection with inspirations.`;

  // Use variant-specific tool description
  const variantTools: Anthropic.Tool[] = [
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
            description: variant.toolDescription,
          },
        },
        required: ["id", "inspirations"],
      },
    },
  ];

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 500,
    system: [
      {
        type: "text",
        text: variant.systemPrompt,
      },
      {
        type: "text",
        text: colorDictionaryText,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
    tools: variantTools,
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
 * Run evaluation on a single test case with a specific variant
 */
async function runEval(
  testCase: { id: string; mood: string },
  variant: PromptVariant,
  anthropic: Anthropic,
  apiKey: string
): Promise<EvalResult> {
  // Generate palette
  const palette = await generatePalette(testCase.mood, variant, anthropic);

  // Rule-based validation
  const ruleBasedChecks = validateFormat(palette.inspirations);

  // LLM judge evaluation
  const llmJudgement = await judgeWithLLM(testCase.mood, palette, apiKey);

  const overallPass = ruleBasedChecks.passed && llmJudgement.passed;

  return {
    testCaseId: testCase.id,
    mood: testCase.mood,
    variantId: variant.id,
    palette,
    ruleBasedChecks,
    llmJudgement,
    overallPass,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate statistics for a variant
 */
function calculateVariantStats(variantId: string, results: EvalResult[]): VariantStats {
  const variantResults = results.filter((r) => r.variantId === variantId);
  const variant = promptVariants.find((v) => v.id === variantId)!;

  const passed = variantResults.filter((r) => r.overallPass).length;
  const failed = variantResults.length - passed;

  return {
    variantId,
    variantName: variant.name,
    totalTests: variantResults.length,
    passed,
    failed,
    passRate: variantResults.length > 0 ? passed / variantResults.length : 0,
    ruleBasedPassRate:
      variantResults.filter((r) => r.ruleBasedChecks.passed).length / variantResults.length,
    llmJudgePassRate:
      variantResults.filter((r) => r.llmJudgement.passed).length / variantResults.length,
    averageRelevanceScore:
      variantResults.reduce((sum, r) => sum + r.llmJudgement.relevanceScore, 0) /
      variantResults.length,
    averageCreativityScore:
      variantResults.reduce((sum, r) => sum + r.llmJudgement.creativityScore, 0) /
      variantResults.length,
    averageVarietyScore:
      variantResults.reduce((sum, r) => sum + r.llmJudgement.varietyScore, 0) /
      variantResults.length,
    averageOverallScore:
      variantResults.reduce((sum, r) => sum + r.llmJudgement.overallScore, 0) /
      variantResults.length,
  };
}

/**
 * Main comparison runner
 */
async function main() {
  console.log("🚀 Starting Prompt Variant Comparison\n");
  console.log(`Testing ${promptVariants.length} prompt variants`);
  console.log(`Running ${testCases.length} test cases per variant`);
  console.log(`Total API calls: ${promptVariants.length * testCases.length * 2}\n`);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not found in environment variables");
  }

  const anthropic = new Anthropic({ apiKey });
  const allResults: EvalResult[] = [];

  // Run evals for each variant
  for (const variant of promptVariants) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Testing Variant: ${variant.name}`);
    console.log(`${"=".repeat(60)}`);

    for (const testCase of testCases) {
      try {
        console.log(`\n  📝 ${testCase.id} - "${testCase.mood}"`);
        const result = await runEval(testCase, variant, anthropic, apiKey);
        allResults.push(result);

        const status = result.overallPass ? "✅ PASS" : "❌ FAIL";
        const scores = `R:${result.llmJudgement.relevanceScore} C:${result.llmJudgement.creativityScore} V:${result.llmJudgement.varietyScore}`;
        console.log(
          `     ${status} | ${scores} | ${result.palette.inspirations.replace(/\n/g, " ")}`
        );

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`     ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }

  // Calculate statistics for each variant
  const variantStats = promptVariants.map((v) => calculateVariantStats(v.id, allResults));

  // Find best variants by different metrics
  const bestByPassRate = variantStats.reduce((best, current) =>
    current.passRate > best.passRate ? current : best
  );
  const bestByRelevance = variantStats.reduce((best, current) =>
    current.averageRelevanceScore > best.averageRelevanceScore ? current : best
  );
  const bestByCreativity = variantStats.reduce((best, current) =>
    current.averageCreativityScore > best.averageCreativityScore ? current : best
  );
  const bestByVariety = variantStats.reduce((best, current) =>
    current.averageVarietyScore > best.averageVarietyScore ? current : best
  );
  const bestByOverall = variantStats.reduce((best, current) =>
    current.averageOverallScore > best.averageOverallScore ? current : best
  );

  const comparisonSummary: ComparisonSummary = {
    totalVariants: promptVariants.length,
    totalTestsPerVariant: testCases.length,
    variantStats,
    bestVariant: {
      byPassRate: bestByPassRate.variantName,
      byRelevance: bestByRelevance.variantName,
      byCreativity: bestByCreativity.variantName,
      byVariety: bestByVariety.variantName,
      byOverallScore: bestByOverall.variantName,
    },
    allResults,
  };

  // Print comparison summary
  console.log("\n\n" + "=".repeat(80));
  console.log("🏆 PROMPT VARIANT COMPARISON RESULTS");
  console.log("=".repeat(80));

  console.log("\n📊 Performance by Variant:\n");
  console.log(
    "Variant".padEnd(30) +
      "Pass Rate".padEnd(12) +
      "Relevance".padEnd(12) +
      "Creativity".padEnd(12) +
      "Variety".padEnd(12) +
      "Overall"
  );
  console.log("-".repeat(88));

  variantStats.forEach((stats) => {
    console.log(
      stats.variantName.substring(0, 28).padEnd(30) +
        `${(stats.passRate * 100).toFixed(1)}%`.padEnd(12) +
        stats.averageRelevanceScore.toFixed(2).padEnd(12) +
        stats.averageCreativityScore.toFixed(2).padEnd(12) +
        stats.averageVarietyScore.toFixed(2).padEnd(12) +
        stats.averageOverallScore.toFixed(2)
    );
  });

  console.log("\n🏅 Best Variants by Metric:\n");
  console.log(`  Pass Rate:      ${comparisonSummary.bestVariant.byPassRate}`);
  console.log(`  Relevance:      ${comparisonSummary.bestVariant.byRelevance}`);
  console.log(`  Creativity:     ${comparisonSummary.bestVariant.byCreativity}`);
  console.log(`  Variety:        ${comparisonSummary.bestVariant.byVariety}`);
  console.log(`  Overall Score:  ${comparisonSummary.bestVariant.byOverallScore}`);

  // Save detailed results to file
  const resultsDir = path.join(__dirname, "../eval-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsFile = path.join(resultsDir, `comparison-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(comparisonSummary, null, 2));

  console.log(`\n📁 Detailed results saved to: ${resultsFile}`);
  console.log("\n✅ Comparison complete!\n");
}

// Run the comparison
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
