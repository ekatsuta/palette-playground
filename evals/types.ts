import type { PaletteWithReasoning } from "../src/types/palette";

export interface TestCase {
  id: string;
  mood: string;
  description: string;
  expectedThemes?: string[]; // Optional themes we expect to see
}

export interface PromptVariant {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  toolDescription: string;
}

export interface EvalResult {
  testCaseId: string;
  mood: string;
  variantId: string;
  palette: PaletteWithReasoning;
  ruleBasedChecks: RuleBasedCheckResults;
  llmJudgement: LLMJudgementResults;
  overallPass: boolean;
  timestamp: string;
}

export interface RuleBasedCheckResults {
  hasCorrectFormat: boolean; // Starts with "- "
  bulletCount: number;
  bulletCountInRange: boolean; // 3-5 bullets
  wordCounts: number[]; // Word count per bullet
  allBulletsShort: boolean; // All bullets 1-5 words
  details: string[];
  passed: boolean;
}

export interface LLMJudgementResults {
  relevanceScore: number; // 1-5
  relevanceReasoning: string;
  creativityScore: number; // 1-5
  creativityReasoning: string;
  varietyScore: number; // 1-5
  varietyReasoning: string;
  overallScore: number; // Average
  passed: boolean;
}

export interface EvalSummary {
  totalTests: number;
  passed: number;
  failed: number;
  ruleBasedPassRate: number;
  llmJudgePassRate: number;
  averageRelevanceScore: number;
  averageCreativityScore: number;
  averageVarietyScore: number;
  results: EvalResult[];
}

export interface VariantStats {
  variantId: string;
  variantName: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  ruleBasedPassRate: number;
  llmJudgePassRate: number;
  averageRelevanceScore: number;
  averageCreativityScore: number;
  averageVarietyScore: number;
  averageOverallScore: number;
}

export interface ComparisonSummary {
  totalVariants: number;
  totalTestsPerVariant: number;
  variantStats: VariantStats[];
  bestVariant: {
    byPassRate: string;
    byRelevance: string;
    byCreativity: string;
    byVariety: string;
    byOverallScore: string;
  };
  allResults: EvalResult[];
}
