import {
  AuditFormData,
  AuditResult,
  ToolEntry,
  ToolRecommendation,
  RecommendationType,
} from "./types";
import { TOOL_MAP, getPlanForTool } from "./tools";
import { nanoid } from "./utils";

// ---------------------------------------------------------------------------
// Audit Engine — hardcoded rules, no AI. Finance-defensible reasoning.
// ---------------------------------------------------------------------------

function evaluateTool(entry: ToolEntry, formData: AuditFormData): ToolRecommendation {
  const tool = TOOL_MAP[entry.toolId];
  const currentPlan = getPlanForTool(entry.toolId, entry.plan);
  const { seats, monthlySpend, toolId } = entry;
  const { useCase } = formData;

  const toolName = tool.name;
  const currentPlanLabel = currentPlan?.label ?? entry.plan;

  // Helper: build a recommendation
  const rec = (
    type: RecommendationType,
    action: string,
    savings: number,
    reasoning: string,
    recommendedPlan?: string,
    confidence: "high" | "medium" | "low" = "high"
  ): ToolRecommendation => ({
    toolId,
    toolName,
    currentPlan: currentPlanLabel,
    currentMonthlySpend: monthlySpend,
    recommendationType: type,
    recommendedAction: action,
    recommendedPlan,
    estimatedMonthlySavings: Math.max(0, Math.round(savings)),
    reasoning,
    confidence,
  });

  // ── Cursor ──────────────────────────────────────────────────────────────
  if (toolId === "cursor") {
    const proPricePerSeat = 20;

    if (entry.plan === "business" && seats <= 3) {
      const downgradeSpend = seats * proPricePerSeat;
      const savings = monthlySpend - downgradeSpend;
      return rec(
        "downgrade_plan",
        `Downgrade to Cursor Pro`,
        savings,
        `Cursor Business ($40/seat) adds SSO and admin controls — only worth it for teams >10. With ${seats} seat(s), you're paying ${formatDelta(savings)}/mo extra for features you almost certainly aren't using. Cursor Pro ($20/seat) covers unlimited completions for small teams.`,
        "pro"
      );
    }

    if (entry.plan === "pro" && useCase !== "coding" && useCase !== "data") {
      return rec(
        "switch_tool",
        `Replace Cursor with Claude Pro for ${useCase}`,
        monthlySpend - 20 * seats,
        `Cursor is a coding IDE. For ${useCase} tasks, you're paying $${monthlySpend}/mo for a tool built for a different job. Claude Pro ($20/seat) is purpose-built for ${useCase} at the same price.`,
        undefined,
        "medium"
      );
    }

    if (entry.plan === "pro" && seats > 10) {
      const credexSavings = monthlySpend * 0.2;
      return rec(
        "use_credits",
        `Purchase Cursor Pro via Credex at ~20% off`,
        credexSavings,
        `At ${seats} seats on Cursor Pro, you're spending $${monthlySpend}/mo retail. Credex sources Cursor credits from companies that overforecast usage — typical discount is 15–25%. Estimated saving: $${Math.round(credexSavings)}/mo.`,
        undefined,
        "medium"
      );
    }

    return rec(
      "optimal",
      "You're on the right Cursor plan",
      0,
      `Cursor ${currentPlanLabel} is appropriate for a ${seats}-person team doing ${useCase} work. No immediate optimization available.`
    );
  }

  // ── GitHub Copilot ──────────────────────────────────────────────────────
  if (toolId === "github_copilot") {
    if (entry.plan === "enterprise" && seats < 10) {
      const businessSpend = seats * 19;
      const savings = monthlySpend - businessSpend;
      return rec(
        "downgrade_plan",
        `Downgrade to GitHub Copilot Business`,
        savings,
        `Copilot Enterprise ($39/seat) adds fine-tuning on private code and Copilot in github.com — features almost exclusively used by teams >10 with large proprietary codebases. At ${seats} seats, Business tier ($19/seat) delivers the same coding assistance for $${savings}/mo less.`,
        "business"
      );
    }

    if (entry.plan === "business" && seats === 1) {
      const savings = monthlySpend - 10;
      return rec(
        "downgrade_plan",
        `Switch to GitHub Copilot Individual`,
        savings,
        `Copilot Business ($19/seat) adds policy management and audit logs — irrelevant for a solo user. Individual plan ($10/seat) delivers the same code completions for $${savings}/mo less.`,
        "individual"
      );
    }

    if (
      (entry.plan === "individual" || entry.plan === "business") &&
      useCase === "coding" &&
      seats >= 1
    ) {
      // Check if Cursor Pro is a better alternative for active coders
      const cursorEntry = formData.tools.find(
        (t) => t.toolId === "cursor" && t.enabled
      );
      if (!cursorEntry) {
        return rec(
          "switch_tool",
          `Consider replacing with Cursor Pro for deeper coding assistance`,
          0,
          `Cursor Pro ($20/seat) offers Copilot-like completions PLUS an agentic chat that can run multi-file edits. At $${monthlySpend}/mo vs Cursor's $${seats * 20}/mo, this is a wash financially — but Cursor ships code faster for most teams. Evaluate based on your IDE preference.`,
          undefined,
          "low"
        );
      }
    }

    return rec(
      "optimal",
      "GitHub Copilot plan looks right for your team",
      0,
      `Copilot ${currentPlanLabel} is appropriately sized for ${seats} seat(s).`
    );
  }

  // ── Claude ──────────────────────────────────────────────────────────────
  if (toolId === "claude") {
    if (entry.plan === "max" && seats > 1) {
      // Max is per-seat, $100/seat — very expensive
      const teamSpend = seats * 30;
      const savings = monthlySpend - teamSpend;
      if (savings > 0) {
        return rec(
          "downgrade_plan",
          `Switch to Claude Team plan`,
          savings,
          `Claude Max ($100/seat) is designed for individual power users who need 20× usage headroom. For a team of ${seats}, Claude Team ($30/seat) provides collaboration features at $${savings}/mo less. Max tier usage quotas don't scale per-seat the way Team does.`,
          "team"
        );
      }
    }

    if (entry.plan === "team" && seats < 5) {
      // Team requires min 5 seats per Anthropic policy — if fewer, likely paying for phantom seats
      const proSpend = seats * 20;
      const savings = monthlySpend - proSpend;
      if (savings > 0) {
        return rec(
          "downgrade_plan",
          `Switch to Claude Pro (individual seats)`,
          savings,
          `Claude Team has a 5-seat minimum. With only ${seats} active users, you may be billed for unused seats. Individual Claude Pro plans ($20/seat) give the same capability without the minimums — saving ~$${savings}/mo.`,
          "pro"
        );
      }
    }

    if (entry.plan === "pro" && useCase === "coding" && seats >= 1) {
      // If they're using Claude Pro for coding, suggest API might be cheaper at volume
      return rec(
        "switch_tool",
        `Evaluate Claude API direct for coding use case`,
        0,
        `Claude Pro ($20/seat flat) is often more expensive than API direct for teams whose coding use is heavy but bursty. If your team makes >100K tokens/month on average, the API ($3/MTok in, $15/MTok out on Sonnet) may be cheaper. Track your actual usage for 30 days.`,
        undefined,
        "low"
      );
    }

    return rec(
      "optimal",
      "Claude plan looks appropriately sized",
      0,
      `Claude ${currentPlanLabel} is a reasonable fit for ${seats} user(s) doing ${useCase} work.`
    );
  }

  // ── ChatGPT ─────────────────────────────────────────────────────────────
  if (toolId === "chatgpt") {
    if (entry.plan === "team" && seats < 3) {
      const plusSpend = seats * 20;
      const savings = monthlySpend - plusSpend;
      return rec(
        "downgrade_plan",
        `Downgrade to ChatGPT Plus (individual)`,
        savings,
        `ChatGPT Team ($30/seat) adds a shared workspace and admin controls. For <3 users, there's no meaningful collaboration benefit. Plus ($20/seat) gives the same GPT-4o access at $${savings}/mo less.`,
        "plus"
      );
    }

    if (entry.plan === "plus" && seats > 1) {
      // Plus is per-person, no team features — flag it
      return rec(
        "optimal",
        "Consider formalizing with ChatGPT Team",
        0,
        `You have ${seats} ChatGPT Plus seats. Team plan ($25/seat annually) adds usage analytics and shared system prompts. At this scale it's a wash — prioritize if you need admin visibility.`,
        undefined,
        "low"
      );
    }

    // If team is also paying for Claude — overlapping chat AI
    const claudeEntry = formData.tools.find(
      (t) => t.toolId === "claude" && t.enabled
    );
    if (claudeEntry && (entry.plan === "plus" || entry.plan === "team")) {
      return rec(
        "switch_tool",
        `Consolidate: you're paying for both ChatGPT and Claude`,
        Math.round(monthlySpend * 0.5),
        `Your team is paying for ChatGPT ${currentPlanLabel} AND Claude ${claudeEntry.plan} — two general-purpose AI assistants with ~70% feature overlap. Pick one as your primary. Most engineering teams prefer Claude for coding/analysis; ChatGPT retains an edge on image generation and plugin ecosystem. Consolidating could save ~$${Math.round(monthlySpend * 0.5)}/mo.`,
        undefined,
        "medium"
      );
    }

    return rec(
      "optimal",
      "ChatGPT plan looks right",
      0,
      `ChatGPT ${currentPlanLabel} is appropriate for ${seats} user(s).`
    );
  }

  // ── Anthropic API ────────────────────────────────────────────────────────
  if (toolId === "anthropic_api") {
    if (monthlySpend > 500) {
      const credexSavings = monthlySpend * 0.18;
      return rec(
        "use_credits",
        `Purchase Anthropic API credits via Credex at ~15–20% off`,
        credexSavings,
        `At $${monthlySpend}/mo on the Anthropic API, you're paying retail token rates. Credex sources pre-paid API credit packages from companies that over-provisioned — typical discount is 15–20%. Estimated saving: $${Math.round(credexSavings)}/mo, or $${Math.round(credexSavings * 12)}/yr.`
      );
    }

    if (monthlySpend < 100 && seats <= 2) {
      return rec(
        "downgrade_plan",
        `Consider switching to Claude Pro plan instead of API`,
        Math.max(0, monthlySpend - 20),
        `At under $100/mo API spend with ${seats} user(s), a Claude Pro subscription ($20/seat/mo) is almost certainly cheaper and includes a better UX for interactive use. API direct makes sense once you're running programmatic workloads at scale.`,
        undefined,
        "medium"
      );
    }

    return rec(
      "optimal",
      "API usage looks reasonable for your scale",
      0,
      `Direct API usage at $${monthlySpend}/mo is appropriate for programmatic workloads.`
    );
  }

  // ── OpenAI API ───────────────────────────────────────────────────────────
  if (toolId === "openai_api") {
    if (monthlySpend > 500) {
      const credexSavings = monthlySpend * 0.18;
      return rec(
        "use_credits",
        `Purchase OpenAI API credits via Credex at ~15–20% off`,
        credexSavings,
        `At $${monthlySpend}/mo retail API spend, Credex can source pre-paid OpenAI credits at 15–20% discount. Estimated saving: $${Math.round(credexSavings)}/mo.`
      );
    }

    if (monthlySpend < 50) {
      return rec(
        "optimal",
        "Low API spend — no immediate optimization",
        0,
        `$${monthlySpend}/mo OpenAI API spend is too small for wholesale credits to make sense. Revisit when spend exceeds $200/mo.`
      );
    }

    return rec(
      "optimal",
      "OpenAI API spend looks reasonable",
      0,
      `$${monthlySpend}/mo on the OpenAI API is in a normal range for your team.`
    );
  }

  // ── Gemini ───────────────────────────────────────────────────────────────
  if (toolId === "gemini") {
    if (entry.plan === "business" && useCase === "coding") {
      return rec(
        "switch_tool",
        `Replace Gemini Workspace with Cursor or Copilot for coding`,
        monthlySpend * 0.3,
        `Gemini Workspace ($30/seat) bundles AI into Google Workspace apps — strong for Docs and Slides. For coding specifically, Cursor Pro ($20/seat) or GitHub Copilot Individual ($10/seat) deliver dramatically better code completions. If your use case is primarily coding, reallocate.`,
        undefined,
        "medium"
      );
    }

    if (entry.plan === "advanced" && seats > 1) {
      return rec(
        "downgrade_plan",
        `Gemini Advanced is individual-only — switch to Workspace for teams`,
        0,
        `Google One AI Premium (Gemini Advanced) is a personal plan. For ${seats} users, Google Workspace with Gemini Business ($30/seat) gives team features. Verify your billing isn't counting individual seats separately.`,
        "business",
        "medium"
      );
    }

    return rec(
      "optimal",
      "Gemini plan looks appropriate",
      0,
      `Gemini ${currentPlanLabel} is a reasonable fit for ${useCase} work.`
    );
  }

  // ── Windsurf ─────────────────────────────────────────────────────────────
  if (toolId === "windsurf") {
    if (entry.plan === "teams" && seats <= 2) {
      const proSpend = seats * 15;
      const savings = monthlySpend - proSpend;
      return rec(
        "downgrade_plan",
        `Downgrade to Windsurf Pro`,
        savings,
        `Windsurf Teams ($35/seat) adds admin controls and centralized billing. With only ${seats} user(s), individual Pro plans ($15/seat) provide the same AI coding features at $${savings}/mo less.`,
        "pro"
      );
    }

    // Windsurf vs Cursor comparison for bigger teams
    if (seats >= 5 && entry.plan === "pro") {
      return rec(
        "optimal",
        "Windsurf Pro is cost-competitive for your team",
        0,
        `Windsurf Pro ($15/seat) is $5/seat cheaper than Cursor Pro ($20/seat). At ${seats} seats, you're already saving $${seats * 5}/mo vs Cursor. No optimization needed.`
      );
    }

    return rec(
      "optimal",
      "Windsurf plan looks appropriate",
      0,
      `Windsurf ${currentPlanLabel} is a solid fit for ${seats} developer(s).`
    );
  }

  // Fallback
  return rec(
    "optimal",
    "No optimization identified",
    0,
    `Could not evaluate ${toolName} ${currentPlanLabel} — data may be incomplete.`,
    undefined,
    "low"
  );
}

function formatDelta(n: number) {
  return `$${Math.abs(Math.round(n))}`;
}

// Check for seat waste across all tools
function detectSeatWaste(
  formData: AuditFormData,
  recs: ToolRecommendation[]
): ToolRecommendation[] {
  const { teamSize, tools } = formData;

  return recs.map((rec) => {
    const entry = tools.find((t) => t.toolId === rec.toolId);
    if (!entry || !teamSize) return rec;

    // If seats > teamSize, flag it
    if (entry.seats > teamSize * 1.1 && entry.seats > 1) {
      const waste = entry.seats - teamSize;
      const tool = TOOL_MAP[entry.toolId];
      const plan = getPlanForTool(entry.toolId, entry.plan);
      if (plan && plan.pricePerSeat > 0) {
        const wastedSpend = waste * plan.pricePerSeat;
        if (wastedSpend > 5) {
          return {
            ...rec,
            recommendationType: "reduce_seats" as RecommendationType,
            recommendedAction: `Remove ${waste} unused ${tool.name} seat(s)`,
            estimatedMonthlySavings: rec.estimatedMonthlySavings + wastedSpend,
            reasoning: `You have ${entry.seats} seats but a team of ${teamSize}. ${waste} seat(s) appear unused — removing them saves $${Math.round(wastedSpend)}/mo on top of any other savings.`,
          };
        }
      }
    }
    return rec;
  });
}

export function runAudit(formData: AuditFormData): AuditResult {
  const enabledTools = formData.tools.filter((t) => t.enabled && t.monthlySpend >= 0);

  let recommendations: ToolRecommendation[] = enabledTools.map((entry) =>
    evaluateTool(entry, formData)
  );

  recommendations = detectSeatWaste(formData, recommendations);

  const totalCurrentSpend = enabledTools.reduce((s, t) => s + t.monthlySpend, 0);
  const totalMonthlySavings = recommendations.reduce(
    (s, r) => s + r.estimatedMonthlySavings,
    0
  );
  const totalOptimizedSpend = Math.max(0, totalCurrentSpend - totalMonthlySavings);
  const totalAnnualSavings = totalMonthlySavings * 12;

  const savingsCategory =
    totalMonthlySavings >= 500
      ? "high"
      : totalMonthlySavings >= 100
      ? "medium"
      : totalMonthlySavings > 0
      ? "low"
      : "optimal";

  return {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    formData,
    recommendations,
    totalCurrentSpend: Math.round(totalCurrentSpend),
    totalOptimizedSpend: Math.round(totalOptimizedSpend),
    totalMonthlySavings: Math.round(totalMonthlySavings),
    totalAnnualSavings: Math.round(totalAnnualSavings),
    savingsCategory,
  };
}
