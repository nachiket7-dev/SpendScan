export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number; // USD, total (seats × per-seat price or direct input)
  seats: number;
  enabled: boolean;
}

export interface AuditFormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export type RecommendationType =
  | "downgrade_plan"
  | "switch_tool"
  | "use_credits"
  | "optimal"
  | "reduce_seats";

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendationType: RecommendationType;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedMonthlySavings: number;
  reasoning: string;
  confidence: "high" | "medium" | "low";
}

export interface AuditResult {
  id: string;
  createdAt: string;
  formData: AuditFormData;
  recommendations: ToolRecommendation[];
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsCategory: "high" | "medium" | "low" | "optimal";
  aiSummary?: string;
}

export interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}
