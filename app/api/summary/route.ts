import { NextRequest } from "next/server";
import { AuditResult } from "@/lib/types";
import { generateFallbackSummary } from "@/lib/fallback-summary";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/summary
 * Accepts an AuditResult and returns a personalized AI-generated summary
 * via the Anthropic API. Falls back to a templated summary on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auditResult = body as AuditResult;

    if (!auditResult || !auditResult.recommendations) {
      return Response.json(
        { error: "Invalid audit result" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key, return fallback immediately
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      const fallback = generateFallbackSummary(auditResult);
      return Response.json({ summary: fallback, source: "fallback" });
    }

    // Build the prompt
    const prompt = buildPrompt(auditResult);

    // Call Anthropic API directly via fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(
          `Anthropic API error: ${response.status} ${response.statusText}`
        );
        const fallback = generateFallbackSummary(auditResult);
        return Response.json({ summary: fallback, source: "fallback" });
      }

      const data = await response.json();
      const summary =
        data.content?.[0]?.text ?? generateFallbackSummary(auditResult);

      return Response.json({
        summary,
        source: data.content?.[0]?.text ? "ai" : "fallback",
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("Anthropic API fetch failed:", fetchError);
      const fallback = generateFallbackSummary(auditResult);
      return Response.json({ summary: fallback, source: "fallback" });
    }
  } catch (error) {
    console.error("Summary endpoint error:", error);
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

function buildPrompt(result: AuditResult): string {
  const { recommendations, totalMonthlySavings, totalAnnualSavings, formData } =
    result;
  const { teamSize, useCase } = formData;

  const toolSummaries = recommendations
    .map((r) => {
      const savings =
        r.estimatedMonthlySavings > 0
          ? `save ${formatCurrency(r.estimatedMonthlySavings)}/mo`
          : "already optimal";
      return `- ${r.toolName} (${r.currentPlan}): ${r.recommendedAction} (${savings})`;
    })
    .join("\n");

  return `You are a concise financial analyst specializing in SaaS cost optimization. Write a personalized 80-100 word summary for a ${teamSize}-person ${useCase} team based on their AI tool spend audit.

Key findings:
- Total potential monthly savings: ${formatCurrency(totalMonthlySavings)}
- Total potential annual savings: ${formatCurrency(totalAnnualSavings)}
- Tools analyzed:
${toolSummaries}

Rules:
- Be specific and reference actual tool names and dollar amounts
- Use a professional but approachable tone
- Lead with the most impactful finding
- If savings are $0, acknowledge they're spending wisely
- Do NOT use markdown formatting, bullet points, or headers — plain text only
- Do NOT mention Credex or any specific vendor recommendations beyond the tools listed`;
}
