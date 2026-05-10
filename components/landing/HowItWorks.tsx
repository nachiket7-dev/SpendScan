"use client";

const STEPS = [
  {
    number: "01",
    title: "Enter your tools",
    description:
      "Select the AI subscriptions your team pays for — plans, seats, and monthly spend.",
  },
  {
    number: "02",
    title: "Instant audit",
    description:
      "Our engine checks every tool against current pricing, your team size, and use case.",
  },
  {
    number: "03",
    title: "See your savings",
    description:
      "Get a per-tool breakdown with exact dollar savings and a one-click action plan.",
  },
  {
    number: "04",
    title: "Share or act",
    description:
      "Share a public link with your team or book a Credex consultation for big wins.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "6rem 1.5rem",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
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
          How it works
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            letterSpacing: "-0.02em",
          }}
        >
          From input to savings in 60 seconds
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="card"
            style={{ padding: "1.75rem" }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: "var(--green)",
                letterSpacing: "0.1em",
                marginBottom: "1rem",
              }}
            >
              {step.number}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
