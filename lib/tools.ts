import { ToolId, UseCase } from "./types";

export interface PlanDefinition {
  id: string;
  label: string;
  pricePerSeat: number; // USD/month per seat, 0 = free
  minSeats?: number;
  maxSeats?: number;
  isApiDirect?: boolean;
  bestFor: UseCase[];
  notes?: string;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  vendor: string;
  category: "coding" | "chat" | "api";
  plans: PlanDefinition[];
  officialPricingUrl: string;
  pricingVerifiedDate: string;
  capabilities: UseCase[];
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: "coding",
    officialPricingUrl: "https://cursor.sh/pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["coding", "data"],
    plans: [
      {
        id: "hobby",
        label: "Hobby",
        pricePerSeat: 0,
        bestFor: ["coding"],
        notes: "2000 completions/month, limited requests",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 20,
        bestFor: ["coding", "data"],
        notes: "Unlimited completions, 500 fast requests",
      },
      {
        id: "business",
        label: "Business",
        pricePerSeat: 40,
        minSeats: 1,
        bestFor: ["coding"],
        notes: "Team features, admin controls, SAML SSO",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0, // custom
        minSeats: 20,
        bestFor: ["coding"],
        notes: "Custom pricing — contact sales",
      },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot#pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["coding", "data"],
    plans: [
      {
        id: "individual",
        label: "Individual",
        pricePerSeat: 10,
        maxSeats: 1,
        bestFor: ["coding"],
        notes: "$100/year if billed annually",
      },
      {
        id: "business",
        label: "Business",
        pricePerSeat: 19,
        minSeats: 1,
        bestFor: ["coding"],
        notes: "Policy management, audit logs",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 39,
        minSeats: 1,
        bestFor: ["coding"],
        notes: "Customization, fine-tuning on private code",
      },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "chat",
    officialPricingUrl: "https://www.anthropic.com/pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["writing", "coding", "research", "data", "mixed"],
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeat: 0,
        bestFor: ["writing", "research"],
        notes: "Rate limited, no Claude 3.5 Sonnet priority",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 20,
        maxSeats: 1,
        bestFor: ["writing", "research", "coding"],
        notes: "5× more usage than free, priority access",
      },
      {
        id: "max",
        label: "Max",
        pricePerSeat: 100,
        maxSeats: 1,
        bestFor: ["research", "coding", "data"],
        notes: "20× more usage than Pro — for power users",
      },
      {
        id: "team",
        label: "Team",
        pricePerSeat: 30,
        minSeats: 5,
        bestFor: ["mixed"],
        notes: "Collaboration, admin controls, $30/user/mo billed annually",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0, // custom
        minSeats: 10,
        bestFor: ["mixed"],
        notes: "Custom pricing, SSO, expanded context",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeat: 0,
        isApiDirect: true,
        bestFor: ["coding", "data", "research"],
        notes: "Pay per token — usage-based",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "chat",
    officialPricingUrl: "https://openai.com/chatgpt/pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["writing", "coding", "research", "data", "mixed"],
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeat: 0,
        bestFor: ["writing"],
        notes: "GPT-4o mini, limited GPT-4o",
      },
      {
        id: "plus",
        label: "Plus",
        pricePerSeat: 20,
        maxSeats: 1,
        bestFor: ["writing", "research", "coding"],
        notes: "GPT-4o, DALL-E, Advanced Data Analysis",
      },
      {
        id: "team",
        label: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        bestFor: ["mixed"],
        notes: "$25/user/mo annually, workspace admin",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        pricePerSeat: 0,
        minSeats: 10,
        bestFor: ["mixed"],
        notes: "Custom pricing, no usage caps, SSO",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeat: 0,
        isApiDirect: true,
        bestFor: ["coding", "data"],
        notes: "Pay per token",
      },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    vendor: "Anthropic",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/api",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["coding", "data", "research", "writing"],
    plans: [
      {
        id: "api_direct",
        label: "API Direct",
        pricePerSeat: 0,
        isApiDirect: true,
        bestFor: ["coding", "data", "research"],
        notes: "Claude 3.5 Sonnet: $3/MTok input, $15/MTok output",
      },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    vendor: "OpenAI",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["coding", "data", "research", "writing"],
    plans: [
      {
        id: "api_direct",
        label: "API Direct",
        pricePerSeat: 0,
        isApiDirect: true,
        bestFor: ["coding", "data"],
        notes: "GPT-4o: $2.50/MTok input, $10/MTok output",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: "chat",
    officialPricingUrl: "https://one.google.com/about/ai-premium",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["writing", "research", "data", "mixed"],
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeat: 0,
        bestFor: ["writing"],
        notes: "Gemini 1.5 Flash, limited 1.5 Pro",
      },
      {
        id: "advanced",
        label: "Advanced (Google One AI Premium)",
        pricePerSeat: 20,
        maxSeats: 1,
        bestFor: ["research", "writing"],
        notes: "Gemini Ultra 1.0, 2TB Google One storage",
      },
      {
        id: "business",
        label: "Workspace Business",
        pricePerSeat: 30,
        minSeats: 1,
        bestFor: ["mixed"],
        notes: "Gemini in Docs, Sheets, Slides, Meet",
      },
      {
        id: "api",
        label: "API Direct",
        pricePerSeat: 0,
        isApiDirect: true,
        bestFor: ["data", "coding"],
        notes: "Gemini 1.5 Pro: $3.50/MTok input (>128K context)",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: "coding",
    officialPricingUrl: "https://codeium.com/windsurf/pricing",
    pricingVerifiedDate: "2025-05-01",
    capabilities: ["coding", "data"],
    plans: [
      {
        id: "free",
        label: "Free",
        pricePerSeat: 0,
        bestFor: ["coding"],
        notes: "Limited Flows and credits",
      },
      {
        id: "pro",
        label: "Pro",
        pricePerSeat: 15,
        maxSeats: 1,
        bestFor: ["coding"],
        notes: "Unlimited completions, 500 credits/month",
      },
      {
        id: "teams",
        label: "Teams",
        pricePerSeat: 35,
        minSeats: 2,
        bestFor: ["coding"],
        notes: "Admin dashboard, team billing",
      },
    ],
  },
];

export const TOOL_MAP: Record<ToolId, ToolDefinition> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t])
) as Record<ToolId, ToolDefinition>;

export const getPlanForTool = (toolId: ToolId, planId: string) => {
  const tool = TOOL_MAP[toolId];
  return tool?.plans.find((p) => p.id === planId);
};

export const TOOL_ICONS: Record<ToolId, string> = {
  cursor: "⚡",
  github_copilot: "🐙",
  claude: "◆",
  chatgpt: "✦",
  anthropic_api: "◆",
  openai_api: "✦",
  gemini: "✧",
  windsurf: "🌊",
};

export const TOOL_COLORS: Record<ToolId, string> = {
  cursor: "#8B5CF6",
  github_copilot: "#2EA44F",
  claude: "#D97706",
  chatgpt: "#10B981",
  anthropic_api: "#D97706",
  openai_api: "#10B981",
  gemini: "#4285F4",
  windsurf: "#06B6D4",
};
