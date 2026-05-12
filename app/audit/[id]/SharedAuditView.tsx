"use client";

import { AuditResult, ToolRecommendation } from "@/lib/types";
import { TOOL_COLORS, TOOL_ICONS } from "@/lib/tools";
import { formatCurrency, RECOMMENDATION_LABELS } from "@/lib/utils";

interface SharedAuditViewProps {
  result: AuditResult;
}

const SAVINGS_COLORS: Record<string, string> = {
  high: "var(--green)",
  medium: "var(--amber)",
  low: "var(--text-muted)",
  optimal: "var(--text-muted)",
};

export function SharedAuditView({ result }: SharedAuditViewProps) {
  const {
    totalCurrentSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsCategory,
    recommendations,
  } = result;

  const savingsColor = SAVINGS_COLORS[savingsCategory];
  const savingsPct =
    totalCurrentSpend > 0
      ? Math.round((totalMonthlySavings / totalCurrentSpend) * 100)
      : 0;

  return (
    <main style={{ minHeight: "100vh", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1rem",
              color: "var(--green)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            SpendScan
          </a>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginTop: 4,
            }}
          >
            Shared audit result
          </div>
        </div>

        {/* Hero savings */}
        <div
          className="card"
          style={{
            padding: "2.5rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            border:
              savingsCategory === "high"
                ? "1px solid var(--green)"
                : "1px solid var(--border)",
            boxShadow:
              savingsCategory === "high"
                ? "0 0 40px var(--green-glow)"
                : "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {savingsCategory === "high" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 0%, #00C85312 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
          )}

          <div
            style={{
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Estimated monthly savings
          </div>

          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              lineHeight: 1,
              color: savingsColor,
              letterSpacing: "-0.03em",
              marginBottom: "0.5rem",
            }}
          >
            {formatCurrency(totalMonthlySavings)}
          </div>

          <div
            style={{
              fontSize: "0.95rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            {formatCurrency(totalAnnualSavings)} annually · {savingsPct}% of
            current spend
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Current spend
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: "var(--text-muted)",
                  textDecoration:
                    totalMonthlySavings > 0 ? "line-through" : "none",
                }}
              >
                {formatCurrency(totalCurrentSpend)}/mo
              </div>
            </div>
            {totalMonthlySavings > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Optimized spend
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: "var(--green)",
                  }}
                >
                  {formatCurrency(result.totalOptimizedSpend)}/mo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary if available */}
        {result.aiSummary && (
          <div
            className="card"
            style={{
              padding: "1.5rem",
              marginBottom: "1.5rem",
              borderLeft: "3px solid var(--green)",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontFamily: "var(--font-mono)",
                color: "var(--green)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              ✦ Audit Summary
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {result.aiSummary}
            </p>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "1rem",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            Per-tool breakdown
          </h3>

          {recommendations.map((rec) => (
            <SharedRecommendationCard key={rec.toolId} rec={rec} />
          ))}
        </div>

        {/* CTA to run own audit */}
        <div
          className="card"
          style={{
            padding: "2rem",
            textAlign: "center",
            marginBottom: "2rem",
            border: "1px solid var(--border-bright)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Want to audit your own AI tool spend?
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            Free, instant, no signup required. Takes under 60 seconds.
          </p>
          <a href="/" className="btn-primary">
            Run my free audit →
          </a>
        </div>
      </div>
    </main>
  );
}

function SharedRecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const color = TOOL_COLORS[rec.toolId];
  const icon = TOOL_ICONS[rec.toolId];
  const isOptimal = rec.recommendationType === "optimal";
  const hasSavings = rec.estimatedMonthlySavings > 0;

  const badgeClass = hasSavings
    ? rec.estimatedMonthlySavings >= 200
      ? "badge badge-green"
      : "badge badge-amber"
    : "badge";

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: "0.5rem",
            }}
          >
            <span aria-hidden="true">{icon}</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              {rec.toolName}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {rec.currentPlan}
            </span>
          </div>

          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: isOptimal ? "var(--text-muted)" : "var(--text)",
              marginBottom: "0.4rem",
            }}
          >
            {rec.recommendedAction}
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            {rec.reasoning}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-dim)",
              marginBottom: 4,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Current
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
              color: "var(--text-muted)",
              marginBottom: "0.75rem",
            }}
          >
            {formatCurrency(rec.currentMonthlySpend)}/mo
          </div>

          {hasSavings && (
            <span className={badgeClass}>
              Save {formatCurrency(rec.estimatedMonthlySavings)}/mo
            </span>
          )}

          {isOptimal && !hasSavings && (
            <span
              className="badge"
              style={{
                background: "#FFFFFF10",
                color: "var(--text-dim)",
                border: "1px solid var(--border)",
              }}
            >
              ✓ Optimal
            </span>
          )}

          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-dim)",
              marginTop: 4,
            }}
          >
            {RECOMMENDATION_LABELS[rec.recommendationType]}
          </div>
        </div>
      </div>
    </div>
  );
}
