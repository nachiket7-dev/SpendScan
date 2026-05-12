"use client";

import { useState } from "react";
import { AuditResult } from "@/lib/types";

interface LeadCaptureFormProps {
  auditResult: AuditResult;
  onSuccess: (shareUrl: string) => void;
}

export function LeadCaptureForm({ auditResult, onSuccess }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          teamSize: auditResult.formData.teamSize,
          auditId: auditResult.id,
          auditResult,
          website, // Honeypot — should be empty
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSubmitted(true);
      if (data.shareUrl) {
        onSuccess(data.shareUrl);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="card"
        style={{
          padding: "2rem",
          textAlign: "center",
          border: "1px solid var(--green)",
          background: "var(--green-dim)",
        }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>✓</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1rem",
            color: "var(--green)",
            marginBottom: "0.25rem",
          }}
        >
          Saved! Check your email for your audit report.
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          You can also share your results with the link below.
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: "1.75rem",
        marginBottom: "1.5rem",
        border: "1px solid var(--border-bright)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            fontFamily: "var(--font-mono)",
            color: "var(--green)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          📧 Save your results
        </span>
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "1.25rem",
          lineHeight: 1.5,
        }}
      >
        Get a copy of your audit report emailed to you, plus a shareable link
        for your team.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Honeypot — hidden from real users, visible to bots */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            opacity: 0,
            height: 0,
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          <label htmlFor="lead-website">Website</label>
          <input
            id="lead-website"
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {/* Email — required */}
          <div>
            <label
              htmlFor="lead-email"
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: 4,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
              }}
            >
              Work email *
            </label>
            <input
              id="lead-email"
              type="email"
              className="input-base"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Company + Role — optional, side by side on desktop */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div>
              <label
                htmlFor="lead-company"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                Company (optional)
              </label>
              <input
                id="lead-company"
                type="text"
                className="input-base"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div>
              <label
                htmlFor="lead-role"
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                Role (optional)
              </label>
              <input
                id="lead-role"
                type="text"
                className="input-base"
                placeholder="Engineering Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                autoComplete="organization-title"
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--red)",
              marginBottom: "0.75rem",
              padding: "0.5rem 0.75rem",
              background: "#FF444415",
              borderRadius: 6,
              border: "1px solid #FF444430",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !email}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(0,0,0,0.3)",
                  borderTopColor: "#000",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }}
              />
              Saving...
            </>
          ) : (
            "Save & get shareable link →"
          )}
        </button>

        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            marginTop: "0.75rem",
            textAlign: "center",
          }}
        >
          No spam. We only email your audit report.
        </p>
      </form>
    </div>
  );
}
