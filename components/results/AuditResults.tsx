"use client";

import { AuditResult, ToolRecommendation } from "@/lib/types";
import { TOOL_COLORS, TOOL_ICONS } from "@/lib/tools";
import { formatCurrency, RECOMMENDATION_LABELS } from "@/lib/utils";

interface AuditResultsProps {
  result: AuditResult;
  onReset: () => void;
}

const SAVINGS_COLORS = {
  high: "var(--green)",
  medium: "var(--amber)",
  low: "var(--text-muted)",
  optimal: "var(--text-muted)",
};

export function AuditResults({ result, onReset }: AuditResultsProps) {
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
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 1rem" }}>
      {/* Hero savings card */}
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
          aria-live="polite"
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
          {formatCurrency(totalAnnualSavings)} annually ·{" "}
          {savingsPct}% of current spend
        </div>

        {/* Spend breakdown */}
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

        {/* Credex CTA for high savings */}
        {savingsCategory === "high" && (
          <div
            style={{
              marginTop: "1.75rem",
              padding: "1.25rem",
              background: "var(--green-dim)",
              border: "1px solid #00C85330",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              textAlign: "left",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "var(--green)",
                  marginBottom: 2,
                }}
              >
                Capture even more savings with Credex
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                We source discounted AI credits from companies that overstocked.
                Typical additional savings: 15–25% on top.
              </div>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ flexShrink: 0, fontSize: "0.85rem", padding: "10px 20px" }}
            >
              Book a consultation →
            </a>
          </div>
        )}
      </div>

      {/* Per-tool breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
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
          <RecommendationCard key={rec.toolId} rec={rec} />
        ))}
      </div>

      {/* Low savings / optimal message */}
      {(savingsCategory === "low" || savingsCategory === "optimal") && (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✓</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              marginBottom: "0.25rem",
            }}
          >
            You&apos;re spending well on AI tools.
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            No significant optimizations found. We&apos;ll let you know when
            pricing changes open up savings for your stack.
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          paddingBottom: "4rem",
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn-ghost" onClick={onReset}>
          ← Start over
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "My AI Spend Audit — SpendScan",
                text: `I could save ${formatCurrency(totalMonthlySavings)}/mo on AI tools.`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
        >
          Share results ↗
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
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
        {/* Tool info + action */}
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

        {/* Savings */}
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
