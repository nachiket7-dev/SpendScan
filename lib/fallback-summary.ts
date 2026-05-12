import { AuditResult } from "./types";
import { formatCurrency } from "./utils";

/**
 * Generates a templated summary when the Anthropic API is unavailable.
 * This ensures users always get a personalized summary, even without AI.
 */
export function generateFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, savingsCategory, recommendations, formData } = result;
  const { teamSize, useCase } = formData;
  const toolCount = recommendations.length;

  const actionableRecs = recommendations.filter(
    (r) => r.recommendationType !== "optimal"
  );
  const optimalCount = recommendations.filter(
    (r) => r.recommendationType === "optimal"
  ).length;

  if (savingsCategory === "optimal") {
    return `Your ${toolCount}-tool AI stack is well-optimized for a ${teamSize}-person ${useCase} team. All ${optimalCount} tools are on the right plans with appropriate seat counts. No immediate cost reductions identified — you're spending efficiently. We'll monitor vendor pricing changes and notify you if new savings opportunities emerge.`;
  }

  const topSaving = actionableRecs.sort(
    (a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings
  )[0];

  const parts: string[] = [];

  parts.push(
    `We analyzed ${toolCount} AI tool${toolCount > 1 ? "s" : ""} for your ${teamSize}-person ${useCase} team and found ${formatCurrency(totalMonthlySavings)}/mo in potential savings (${formatCurrency(totalAnnualSavings)}/yr).`
  );

  if (topSaving) {
    parts.push(
      `Your biggest opportunity: ${topSaving.recommendedAction.toLowerCase()} — saving ${formatCurrency(topSaving.estimatedMonthlySavings)}/mo.`
    );
  }

  if (optimalCount > 0) {
    parts.push(
      `${optimalCount} of your ${toolCount} tools are already optimally configured.`
    );
  }

  if (savingsCategory === "high") {
    parts.push(
      `With savings above $500/mo, Credex can source additional discounted credits to stack even more savings.`
    );
  }

  return parts.join(" ");
}
