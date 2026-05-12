"use client";

import { useState } from "react";
import { AuditForm } from "./AuditForm";
import { AuditResults } from "@/components/results/AuditResults";
import { useAuditStore } from "@/lib/store";

export function AuditFormWrapper() {
  const { auditResult, setAuditResult } = useAuditStore();
  const [showResults, setShowResults] = useState(false);

  const handleFormSubmit = () => {
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    setAuditResult(null);
    setTimeout(() => {
      document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section
      id="audit"
      style={{ padding: "5rem 1.5rem 2rem" }}
      aria-label="AI spend audit tool"
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--green)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Your audit
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {showResults ? "Your AI spend report" : "Enter your AI tools"}
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            marginTop: "0.5rem",
          }}
        >
          {showResults
            ? "Here's where you can optimize."
            : "Toggle the tools you pay for and enter your current spend."}
        </p>
      </div>

      {!showResults || !auditResult ? (
        <AuditForm onSubmit={handleFormSubmit} />
      ) : (
        <div id="results">
          <AuditResults result={auditResult} onReset={handleReset} />
        </div>
      )}
    </section>
  );
}
