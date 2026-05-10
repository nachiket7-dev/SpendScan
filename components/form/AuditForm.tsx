"use client";

import { useState } from "react";
import { useAuditStore } from "@/lib/store";
import { TOOLS } from "@/lib/tools";
import { ToolCard } from "./ToolCard";
import { runAudit } from "@/lib/audit-engine";
import { UseCase } from "@/lib/types";
import { USE_CASE_LABELS } from "@/lib/utils";

const USE_CASES: UseCase[] = ["coding", "writing", "data", "research", "mixed"];

interface AuditFormProps {
  onSubmit: () => void;
}

export function AuditForm({ onSubmit }: AuditFormProps) {
  const {
    formData,
    setTool,
    toggleTool,
    setTeamSize,
    setUseCase,
    setAuditResult,
  } = useAuditStore();

  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const enabledCount = formData.tools.filter((t) => t.enabled).length;
  const totalSpend = formData.tools
    .filter((t) => t.enabled)
    .reduce((s, t) => s + t.monthlySpend, 0);

  const handleSubmit = async () => {
    setError(null);

    if (enabledCount === 0) {
      setError("Select at least one AI tool to audit.");
      return;
    }

    const invalidTool = formData.tools.find(
      (t) => t.enabled && t.monthlySpend <= 0
    );
    if (invalidTool) {
      setError(
        `Enter a monthly spend amount for all enabled tools (check ${
          TOOLS.find((t) => t.id === invalidTool.toolId)?.name
        }).`
      );
      return;
    }

    setIsRunning(true);

    // Slight delay for UX — feels more like computation is happening
    await new Promise((r) => setTimeout(r, 800));

    const result = runAudit(formData);
    setAuditResult(result);
    setIsRunning(false);
    onSubmit();
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "0 1rem",
      }}
    >
      {/* Context inputs */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
        }}
      >
        <div>
          <label
            htmlFor="team-size"
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Team size (people using AI tools)
          </label>
          <input
            id="team-size"
            type="number"
            min={1}
            max={10000}
            className="input-base"
            value={formData.teamSize || ""}
            placeholder="e.g. 5"
            onChange={(e) =>
              setTeamSize(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
        </div>

        <div>
          <label
            htmlFor="use-case"
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Primary use case
          </label>
          <select
            id="use-case"
            className="input-base"
            value={formData.useCase}
            onChange={(e) => setUseCase(e.target.value as UseCase)}
          >
            {USE_CASES.map((uc) => (
              <option key={uc} value={uc}>
                {USE_CASE_LABELS[uc]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {TOOLS.map((tool) => {
          const entry = formData.tools.find((t) => t.toolId === tool.id)!;
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              entry={entry}
              onChange={(updates) => setTool(tool.id, updates)}
              onToggle={() => toggleTool(tool.id)}
            />
          );
        })}
      </div>

      {/* Summary bar + submit */}
      <div
        className="card-bright"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
          position: "sticky",
          bottom: "1.5rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Tools selected
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.3rem",
                color: enabledCount > 0 ? "var(--text)" : "var(--text-dim)",
              }}
            >
              {enabledCount}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Total monthly spend
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.3rem",
                color:
                  totalSpend > 0 ? "var(--text)" : "var(--text-dim)",
              }}
            >
              ${totalSpend.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {error && (
            <p
              role="alert"
              style={{
                fontSize: "0.8rem",
                color: "var(--red)",
                textAlign: "right",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || enabledCount === 0}
            aria-busy={isRunning}
          >
            {isRunning ? (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid #00000040",
                    borderTopColor: "#000",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Running audit…
              </>
            ) : (
              "Run audit →"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
