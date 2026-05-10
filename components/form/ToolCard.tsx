"use client";

import { ToolDefinition } from "@/lib/tools";
import { ToolEntry } from "@/lib/types";
import { TOOL_COLORS, TOOL_ICONS } from "@/lib/tools";

interface ToolCardProps {
  tool: ToolDefinition;
  entry: ToolEntry;
  onChange: (updates: Partial<ToolEntry>) => void;
  onToggle: () => void;
}

export function ToolCard({ tool, entry, onChange, onToggle }: ToolCardProps) {
  const color = TOOL_COLORS[tool.id];
  const icon = TOOL_ICONS[tool.id];
  const isEnabled = entry.enabled;

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        border: isEnabled
          ? `1px solid ${color}40`
          : "1px solid var(--border)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: isEnabled ? `0 0 20px ${color}15` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Color accent strip */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: isEnabled ? color : "transparent",
          transition: "background 0.2s",
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isEnabled ? "1rem" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{
              fontSize: "1.2rem",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${color}20`,
              borderRadius: 8,
            }}
          >
            {icon}
          </span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              {tool.name}
            </div>
            <div
              style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
            >
              {tool.vendor}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Toggle ${tool.name}`}
          onClick={onToggle}
          style={{
            width: 44,
            height: 24,
            borderRadius: 100,
            background: isEnabled ? color : "var(--border-bright)",
            border: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 3,
              left: isEnabled ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: isEnabled ? "#000" : "var(--text-dim)",
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>

      {/* Expanded fields */}
      {isEnabled && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
          }}
        >
          {/* Plan selector */}
          <div>
            <label
              htmlFor={`${tool.id}-plan`}
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 4,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Plan
            </label>
            <select
              id={`${tool.id}-plan`}
              className="input-base"
              value={entry.plan}
              onChange={(e) => onChange({ plan: e.target.value })}
            >
              {tool.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.pricePerSeat > 0 ? ` — $${p.pricePerSeat}/seat` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Seats */}
          <div>
            <label
              htmlFor={`${tool.id}-seats`}
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 4,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Seats
            </label>
            <input
              id={`${tool.id}-seats`}
              type="number"
              min={1}
              max={10000}
              className="input-base"
              value={entry.seats || ""}
              placeholder="1"
              onChange={(e) =>
                onChange({ seats: Math.max(1, parseInt(e.target.value) || 1) })
              }
            />
          </div>

          {/* Monthly spend */}
          <div>
            <label
              htmlFor={`${tool.id}-spend`}
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                marginBottom: 4,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              $/Month
            </label>
            <input
              id={`${tool.id}-spend`}
              type="number"
              min={0}
              step={1}
              className="input-base"
              value={entry.monthlySpend || ""}
              placeholder="0"
              onChange={(e) =>
                onChange({
                  monthlySpend: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
            />
          </div>

          {/* Plan hint */}
          {tool.plans.find((p) => p.id === entry.plan)?.notes && (
            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                padding: "6px 10px",
                background: "var(--bg)",
                borderRadius: 6,
                borderLeft: `2px solid ${color}60`,
              }}
            >
              {tool.plans.find((p) => p.id === entry.plan)?.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
