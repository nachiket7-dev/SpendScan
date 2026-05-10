import { describe, it, expect } from "vitest";
import { runAudit } from "../lib/audit-engine";
import { AuditFormData } from "../lib/types";

// ---------------------------------------------------------------------------
// Test 1: Cursor Business with small team → downgrade to Pro
// ---------------------------------------------------------------------------
describe("Cursor audit rules", () => {
  it("recommends downgrading Cursor Business to Pro for teams ≤3 seats", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "cursor",
          plan: "business",
          monthlySpend: 120, // 3 seats × $40
          seats: 3,
          enabled: true,
        },
      ],
      teamSize: 3,
      useCase: "coding",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("downgrade_plan");
    expect(rec.estimatedMonthlySavings).toBe(60); // $120 - $60 (3×$20)
    expect(rec.recommendedPlan).toBe("pro");
  });

  it("marks Cursor Pro as optimal for a coding team", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 60,
          seats: 3,
          enabled: true,
        },
      ],
      teamSize: 3,
      useCase: "coding",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("optimal");
    expect(rec.estimatedMonthlySavings).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Test 2: GitHub Copilot Enterprise overkill for small team
// ---------------------------------------------------------------------------
describe("GitHub Copilot audit rules", () => {
  it("recommends downgrading Enterprise to Business for teams <10 seats", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "github_copilot",
          plan: "enterprise",
          monthlySpend: 195, // 5 seats × $39
          seats: 5,
          enabled: true,
        },
      ],
      teamSize: 5,
      useCase: "coding",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("downgrade_plan");
    expect(rec.estimatedMonthlySavings).toBe(100); // $195 - $95 (5×$19)
    expect(rec.recommendedPlan).toBe("business");
  });
});

// ---------------------------------------------------------------------------
// Test 3: ChatGPT + Claude overlap → consolidation flag
// ---------------------------------------------------------------------------
describe("Cross-tool overlap detection", () => {
  it("flags consolidation opportunity when both ChatGPT and Claude are enabled", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "chatgpt",
          plan: "team",
          monthlySpend: 150, // 5 × $30
          seats: 5,
          enabled: true,
        },
        {
          toolId: "claude",
          plan: "team",
          monthlySpend: 150,
          seats: 5,
          enabled: true,
        },
      ],
      teamSize: 5,
      useCase: "mixed",
    };

    const result = runAudit(formData);
    const chatgptRec = result.recommendations.find((r) => r.toolId === "chatgpt");

    expect(chatgptRec?.recommendationType).toBe("switch_tool");
    expect(chatgptRec?.estimatedMonthlySavings).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Test 4: Anthropic API at high volume → Credex recommendation
// ---------------------------------------------------------------------------
describe("Anthropic API audit rules", () => {
  it("recommends Credex credits for API spend >$500/mo", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "anthropic_api",
          plan: "api_direct",
          monthlySpend: 800,
          seats: 1,
          enabled: true,
        },
      ],
      teamSize: 3,
      useCase: "coding",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("use_credits");
    expect(rec.estimatedMonthlySavings).toBeGreaterThan(100);
  });

  it("recommends switching to Claude Pro when API spend is low (<$100) and team is small", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "anthropic_api",
          plan: "api_direct",
          monthlySpend: 45,
          seats: 1,
          enabled: true,
        },
      ],
      teamSize: 1,
      useCase: "writing",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("downgrade_plan");
    expect(rec.estimatedMonthlySavings).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Test 5: Seat waste detection
// ---------------------------------------------------------------------------
describe("Seat waste detection", () => {
  it("detects seats > teamSize and upgrades recommendation to reduce_seats", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 200, // 10 seats × $20
          seats: 10,
          enabled: true,
        },
      ],
      teamSize: 6, // only 6 people — 4 seats wasted
      useCase: "coding",
    };

    const result = runAudit(formData);
    const rec = result.recommendations[0];

    expect(rec.recommendationType).toBe("reduce_seats");
    expect(rec.estimatedMonthlySavings).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Test 6: Total savings calculation integrity
// ---------------------------------------------------------------------------
describe("Audit totals", () => {
  it("correctly sums totalMonthlySavings across multiple tools", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "cursor",
          plan: "business",
          monthlySpend: 120, // 3 × $40, saves $60
          seats: 3,
          enabled: true,
        },
        {
          toolId: "github_copilot",
          plan: "enterprise",
          monthlySpend: 195, // 5 × $39, saves $100
          seats: 5,
          enabled: true,
        },
      ],
      teamSize: 5,
      useCase: "coding",
    };

    const result = runAudit(formData);

    expect(result.totalCurrentSpend).toBe(315);
    expect(result.totalMonthlySavings).toBe(160);
    expect(result.totalAnnualSavings).toBe(1920);
    expect(result.savingsCategory).toBe("medium");
  });

  it("returns savingsCategory high when savings exceed $500/mo", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "anthropic_api",
          plan: "api_direct",
          monthlySpend: 3000,
          seats: 1,
          enabled: true,
        },
      ],
      teamSize: 10,
      useCase: "coding",
    };

    const result = runAudit(formData);
    expect(result.savingsCategory).toBe("high");
  });

  it("returns savingsCategory optimal when no savings found", () => {
    const formData: AuditFormData = {
      tools: [
        {
          toolId: "cursor",
          plan: "pro",
          monthlySpend: 20,
          seats: 1,
          enabled: true,
        },
      ],
      teamSize: 1,
      useCase: "coding",
    };

    const result = runAudit(formData);
    expect(result.savingsCategory).toBe("optimal");
    expect(result.totalMonthlySavings).toBe(0);
  });
});
