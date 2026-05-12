"use client";

export function LandingHero() {
  return (
    <section
      className="grid-bg relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Gradient orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, #00C85315 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="animate-fade-up"
          style={{ opacity: 0, animationFillMode: "forwards" }}
        >
          <span className="badge badge-green mb-8 inline-flex">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--green)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            Free · No signup required
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            opacity: 0,
            animationFillMode: "forwards",
            marginBottom: "1.5rem",
          }}
        >
          Stop overpaying
          <br />
          for{" "}
          <span className="gradient-text">AI tools.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up delay-200"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            fontSize: "1.25rem",
            color: "var(--text-muted)",
            maxWidth: 540,
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
          }}
        >
          Enter your AI subscriptions. Get an instant audit showing exactly
          where you&apos;re overspending and how much you can save.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-up delay-300"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a href="#audit" className="btn-primary">
            Audit my AI spend →
          </a>
          <a
            href="#how-it-works"
            className="btn-ghost"
            style={{ color: "var(--text-muted)" }}
          >
            How it works
          </a>
        </div>

        {/* Social proof */}
        <div
          className="animate-fade-up delay-400"
          style={{
            opacity: 0,
            animationFillMode: "forwards",
            marginTop: "3rem",
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { stat: "8 tools", label: "audited" },
            { stat: "~60s", label: "to complete" },
            { stat: "$0", label: "to use" },
          ].map(({ stat, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "var(--green)",
                }}
              >
                {stat}
              </div>
              <div
                style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="animate-fade-up delay-500"
        style={{
          opacity: 0,
          animationFillMode: "forwards",
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "var(--text-dim)",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, var(--border-bright), transparent)",
          }}
        />
        scroll
      </div>
    </section>
  );
}
