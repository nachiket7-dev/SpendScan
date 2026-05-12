# REFLECTION.md

## 1. What was the hardest part of this project?

**The audit engine's honesty problem.** The temptation is to manufacture impressive-looking savings numbers — recommend downgrades everywhere, flag every tool as "overspend." But that destroys trust the moment a CFO looks at the report and realizes the recommendations don't hold up.

The hardest work was designing rules that return `optimal` when there's genuinely nothing to optimize. Every tool has an `optimal` code path. The engine says "you're spending well" when you are. This makes the cases where it *does* find savings more credible — because users know the system isn't trying to sell them something on every line item.

The second hardest part was the cross-tool overlap detection. Evaluating each tool in isolation is straightforward, but recognizing that "paying for both ChatGPT Team and Claude Team is redundant" requires a second pass over the full recommendation set with team context. This two-pass architecture (per-tool evaluation → cross-tool enrichment) ended up being clean, but getting there required re-thinking the data flow twice.

## 2. If I had two more weeks, what would I add?

1. **Benchmark mode** — show "companies like yours spend X on average." This requires a data pipeline: aggregate anonymized audit results into industry benchmarks by team size and use case. Storage: Supabase view over the `audit_snapshots` table, grouped by use case.

2. **API usage estimation** — for API-direct tools (Anthropic API, OpenAI API), let users input their estimated token usage. The engine could then compare their per-token cost against competitors (e.g., Gemini 1.5 Pro vs Claude 3.5 Sonnet for the same workload).

3. **PDF export** — a downloadable audit report that engineering managers can attach to budget review emails. Using `@react-pdf/renderer` or server-side Puppeteer.

4. **Team invite flow** — let one user start the audit, then invite teammates to fill in their own tool usage. Combine into a single team audit. Requires auth (NextAuth).

5. **Pricing alert system** — when a vendor changes their pricing (e.g., Cursor raises Pro from $20→$25), automatically email all users who use that tool with an updated audit.

## 3. What tradeoff am I least satisfied with?

**The in-memory rate limiter.** It works for a single-instance deployment, but it won't survive Vercel's serverless model where each function invocation is isolated. In production, every invocation gets a fresh `Map()`, so the rate limit is effectively meaningless.

The right fix is Upstash Redis (Vercel's recommended rate limiting solution), but I chose not to add another service dependency during the 7-day sprint. The code is structured so that swapping `isRateLimited()` to use Redis is a <20 line change — the interface is clean.

I'm also not fully satisfied with the Supabase integration being entirely fetch-based. The `@supabase/supabase-js` SDK provides retry logic, connection pooling, and type generation that my lightweight wrapper doesn't. For a production app, I'd switch to the SDK.

## 4. How would I verify the audit recommendations are correct?

1. **Unit tests with known scenarios** — I have 10 tests covering specific combinations of tool, plan, seats, and team size. Each test asserts the exact recommendation type and savings amount. If someone changes a rule, the test breaks immediately.

2. **Manual scenario testing** — during Day 2, I ran through 5 realistic audit scenarios (solo developer, 5-person startup, 20-person team, API-heavy team, mixed use case) and verified every recommendation makes logical sense.

3. **Pricing source verification** — every price in `lib/tools.ts` traces to a specific URL in `PRICING_DATA.md`. I can re-verify by visiting each URL and comparing. This is manual but necessary — pricing APIs don't exist for most of these tools.

4. **Defensibility check** — every recommendation includes a `reasoning` field that explains *why* in plain English. If the reasoning sounds wrong when read aloud, the rule is wrong. This is a qualitative check, but it's the most important one.

5. **At scale** — I'd add Sentry error tracking to catch when `evaluateTool()` hits the fallback path (which means an unhandled tool/plan combination), and PostHog funnel analytics to track how often users click "Start over" after seeing results (which might indicate bad recommendations).

## 5. What's one thing I'd do differently if I started over?

**I'd start with the shareable URL page, not the form.**

The shareable URL (`/audit/[id]`) is the virality engine — it's what gets posted on Twitter, shared in Slack, and forwarded to CTOs. If I'd designed that page first, I would have:

- Structured the `AuditResult` type around "what looks compelling when shared" rather than "what the form produces"
- Designed the OG image first (the preview people see on social media) and worked backwards to the data model
- Built the CTA ("Run your own audit →") as the primary conversion path, making the landing page secondary

Instead, I designed form-first, which meant the share page was an adaptation of the results page rather than its own purpose-built experience. The end result works, but the share page could be more visually distinct and optimized for conversion if I'd started there.
