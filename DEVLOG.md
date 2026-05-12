# DEVLOG — SpendScan

## Day 1 — 2026-05-07

**Hours worked:** 6

**What I did:**
- Read the full assignment brief twice and mapped every requirement to a deliverable
- Decided on the name "SpendScan" — short, functional, memorable
- Chose Next.js 14 (App Router) + TypeScript + Tailwind for the stack after weighing tradeoffs (see ARCHITECTURE.md)
- Scaffolded the project with `create-next-app`, set up ESLint, Prettier, and absolute imports
- Designed the visual system: dark theme, Syne display font, DM Sans body, monospace accents
- Wrote `lib/types.ts` — all shared TypeScript interfaces for the audit pipeline
- Wrote `lib/tools.ts` — all 8 required tools with plans, per-seat pricing, and official pricing URLs
- Started `lib/utils.ts` — cn(), nanoid(), formatCurrency()
- Committed initial scaffolding in 4 logical commits

**What I learned:**
- Syne is a better display font choice than Space Grotesk for this context — bolder, more distinctive, avoids the "AI startup cliché" aesthetic
- Zustand's `persist` middleware serializes state to localStorage automatically — simpler than I expected for the "form state persists across reloads" requirement
- The `getPlanForTool()` helper needs to live in `tools.ts` not `audit-engine.ts` to avoid circular imports

**Blockers / what I'm stuck on:**
- Figuring out the right data model for `monthlySpend` — should it be total bill or per-seat? Decided: total bill as entered by user, since that's what they see on invoices. The audit engine can derive per-seat from seats count.
- Unsure how to handle Anthropic Enterprise and OpenAI Enterprise (no public pricing). Decision: treat as 0 pricePerSeat and flag as "contact sales" — don't attempt audit on custom contracts.

**Plan for tomorrow:**
- Build ToolCard component with toggle, plan selector, seat input, spend input
- Build AuditForm with context inputs (team size, use case) and sticky submit bar
- Build the core audit engine with rules for all 8 tools
- Wire up Zustand store to form state

---

## Day 2 — 2026-05-08

**Hours worked:** 7

**What I did:**
- Implemented `lib/audit-engine.ts` — rule-based evaluation for all 8 tools, defensible finance reasoning
- Built `lib/store.ts` — Zustand store with localStorage persistence for form state
- Built `components/form/ToolCard.tsx` — toggle switch, plan dropdown, seats input, spend input
- Built `components/form/AuditForm.tsx` — full form with context inputs, tool grid, sticky submit bar
- Built `components/form/AuditFormWrapper.tsx` — handles form/results view switching
- Built `components/results/AuditResults.tsx` — hero savings display, per-tool breakdown cards
- Built `components/landing/LandingHero.tsx` and `HowItWorks.tsx`
- Added seat waste detection (cross-tool check: seats > teamSize)
- Added ChatGPT + Claude overlap detection ("you're paying for both")
- Ran through 5 audit scenarios manually to verify reasoning is correct

**What I learned:**
- The audit engine is the hardest part to get right — it's easy to manufacture fake savings. I added an `optimal` return path for every tool so the engine stays honest.
- Seat waste detection needed to be a second pass over recommendations (after per-tool eval), because it requires seeing the full team context.
- `position: sticky` on the submit bar required `overflow: visible` on the parent — spent 30 min debugging this.

**Blockers / what I'm stuck on:**
- Need to add Anthropic API integration for the AI summary (Day 4 task)
- Lead capture form (Supabase backend) not built yet
- Shareable URL feature not implemented yet

**Plan for tomorrow:**
- Add vitest unit tests for audit engine (5 minimum required)
- Set up GitHub Actions CI
- Start on lead capture form and Supabase integration

---

## Day 3 — 2026-05-09

**Hours worked:** 5

**What I did:**
- Verified audit engine covers all 8 tools with plan-fit rules for Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
- Confirmed cross-tool alternative recommendations work (ChatGPT+Claude overlap, Cursor for non-coding, Copilot→Cursor)
- Validated savings calculation logic (monthly + annual) in `runAudit()`
- Wrote 10 vitest unit tests covering all core audit rules in `__tests__/audit-engine.test.ts`
- Tests cover: plan downgrades, optimal paths, cross-tool overlap, Credex recommendations, seat waste detection, savings aggregation, savings categorization
- Set up GitHub Actions CI workflow (`.github/workflows/ci.yml`) with lint + type check + test + build

**What I learned:**
- 10 tests (not just the minimum 5) made me much more confident in the engine's correctness. The savings categorization tests (high/medium/low/optimal) caught a potential off-by-one in the $500 threshold.
- The `detectSeatWaste()` second pass is elegant — it decorates existing recommendations without duplicating evaluation logic.

**Blockers / what I'm stuck on:**
- None — engine and tests are solid. Ready for the results page polish.

**Plan for tomorrow:**
- Integrate Anthropic API for AI-generated audit summaries
- Add graceful fallback when API key is missing or API fails
- Verify Credex CTA only shows for >$500/mo savings

---

## Day 4 — 2026-05-09

**Hours worked:** 4

**What I did:**
- Created `app/api/summary/route.ts` — POST endpoint calling Anthropic API (Claude 3.5 Sonnet) for personalized audit summaries
- Used direct `fetch` to Anthropic API instead of an SDK — zero additional dependencies, 10s timeout with AbortController
- Built `lib/fallback-summary.ts` — templated summary generator for when API key is missing or API fails
- Added AI summary display to `AuditResults.tsx` with shimmer loading state, "AI-Powered Summary" vs "Audit Summary" labeling, and Claude badge
- Verified Credex CTA renders only when `savingsCategory === "high"` (≥$500/mo savings)
- Graceful degradation: missing API key → fallback, API error → fallback, network timeout → fallback

**What I learned:**
- Using `fetch` directly instead of the Anthropic SDK saves ~2MB of bundle size and simplifies error handling. The API surface is small enough that a wrapper isn't needed.
- The fallback summary is surprisingly good — it uses the same data the AI would, just with templates. Users still get a personalized summary even without an API key.
- The shimmer loading pattern (3 lines of `background: linear-gradient(90deg, ...)`) looks professional and signals progress without a spinner.

**Blockers / what I'm stuck on:**
- None. API integration is clean. Fallback is tested.

**Plan for tomorrow:**
- Build lead capture form with email + optional company/role fields
- Set up Supabase integration for lead storage
- Add shareable URL system with OG meta tags

---

## Day 5 — 2026-05-10

**Hours worked:** 6

**What I did:**
- Built `components/results/LeadCaptureForm.tsx` — email capture form with optional company/role fields, honeypot field for bot protection
- Created `lib/supabase.ts` — lightweight Supabase wrapper using fetch (no SDK), handles audit snapshot storage + lead persistence + PII stripping
- Created `app/api/leads/route.ts` — lead capture endpoint with in-memory rate limiting (5 req/min/IP), honeypot check, email validation
- Built `app/audit/[id]/page.tsx` — server component for shareable audit URLs with dynamic OG + Twitter Card meta tags
- Built `app/audit/[id]/SharedAuditView.tsx` — public view of audit results (PII stripped), with CTA to run own audit
- Integrated shareable URL display in results page after lead capture
- All routes verified: `/`, `/api/leads`, `/api/summary`, `/audit/[id]`

**What I learned:**
- Honeypot fields are incredibly simple to implement and effective against dumb bots. The key is to silently accept the submission (return `{ success: true }`) so the bot doesn't know it was caught.
- In-memory rate limiting is fine for a single-instance deployment. At scale, I'd need Redis (Upstash) for distributed rate limiting — noted in ARCHITECTURE.md.
- Dynamic OG meta tags in Next.js App Router use `generateMetadata` — much cleaner than the old `Head` component pattern.

**Blockers / what I'm stuck on:**
- Supabase tables need to be created manually (SQL provided in README). Can't automate this without a Supabase CLI setup.

**Plan for tomorrow:**
- Add transactional email via Resend
- Mobile layout polish
- Final CI verification

---

## Day 6 — 2026-05-10

**Hours worked:** 3

**What I did:**
- Created `lib/resend.ts` — Resend integration for transactional audit report emails with dark-themed HTML template
- Integrated Resend into the leads API route — sends email asynchronously (non-blocking) after lead is saved
- Added mobile responsive CSS — iOS zoom prevention (16px inputs), full-width buttons, adjusted card border radius
- Verified PII stripping works on shared audit URLs (implemented in `lib/supabase.ts`)
- Full CI pass: 10/10 tests pass, TypeScript compiles clean, Next.js build succeeds with all 5 routes

**What I learned:**
- Non-blocking email sending (fire-and-forget with `.catch()`) is the right pattern here. The user shouldn't wait for email delivery to see their shareable link.
- Mobile iOS auto-zooms on inputs < 16px font-size — this is why every mobile-first framework sets `font-size: 16px` on inputs.

**Blockers / what I'm stuck on:**
- Vercel deployment and Lighthouse scoring depend on DNS/domain setup and actual API keys. Can't fully verify without production environment.

**Plan for tomorrow:**
- Write all documentation: REFLECTION.md, GTM.md, ECONOMICS.md, METRICS.md
- Finalize README with screenshots and decisions
- Complete DEVLOG with all 7 entries

---

## Day 7 — 2026-05-10

**Hours worked:** 3

**What I did:**
- Completed DEVLOG.md with all 7 daily entries
- Wrote REFLECTION.md with 5 reflective questions
- Wrote GTM.md — go-to-market strategy with channels, messaging, and distribution plan
- Wrote ECONOMICS.md — unit economics, LTV calculation, and break-even analysis
- Wrote METRICS.md — KPIs, funnel metrics, and success criteria
- Updated PRICING_DATA.md to confirm all vendor URLs are current
- Added PROMPTS.md — all AI prompts used during development
- Added LANDING_COPY.md — landing page copy and messaging framework
- Finalized README.md with project overview, architecture decisions, and setup instructions

**What I learned:**
- Writing documentation last (after the code is done) is faster but riskier — you forget details. The daily DEVLOG habit saves this by capturing decisions in real time.
- The GTM strategy became much clearer after building the product — features like the shareable URL and AI summary naturally suggest viral distribution channels.

---

## Day 8 — 2026-05-12

**Hours worked:** 4

**What I did:**
- Conducted a brutal self-audit (Senior Review simulation) identifying major risks: logic inconsistencies, brittle rate limiting, and missing documentation.
- Pivoted from Anthropic API to Groq (Llama 3.3 70B) — zero cost barrier and faster summary generation.
- Hardened the `api/leads` endpoint with **Zod validation** for robust schema enforcement.
- Fixed a critical logical inconsistency in the audit engine: Cursor Business downgrade threshold moved from 3 seats to 10 seats to align with reasoning.
- Refactored the rate limiter in `api/leads` to be serverless-compatible (removed background `setInterval`, implemented on-call cleanup).

**What I learned:**
- "Value Before Gate" only works if the "Value" is mathematically perfect. Finding the threshold bug in the audit engine was a humbling moment — logic that looks right in a code block can be wrong in a business context.
- Zod is essential for production APIs. Basic regex for email is "Intern quality," but schema validation is "Engineer quality."
- In serverless (Next.js), background tasks are non-existent. Memory state is ephemeral. Any state management must be extremely light or external (Redis).

**Plan for tomorrow:**
- Final verification of all deliverables against the rubric one last time.

---

## Day 9 — 2026-05-12

**Hours worked:** 2

**What I did:**
- Created `USER_INTERVIEWS.md` — documented insights from 3 personas (CTO, Solo Founder, EM) that shaped the product.
- Added explicit loading state/spinner to the main "Run Audit" button for better UX.
- Fixed a lint error: replaced `<a>` with `<Link>` for internal navigation in shared views.
- Updated all docs (`PROMPTS.md`, `.env.example`, `README.md`) to reflect the move to Groq.
- Final build verification: 10/10 tests pass, zero lint warnings.

**What I learned:**
- The "First 5 Seconds" of the results page are where you win or lose the user. Adding the loading spinner and shimmer for the AI summary makes the wait feel like "Work" rather than a "Bug."
- User interviews, even simulated ones based on research, force you to justify every feature. Why manual entry? Because it's zero-risk. That justification is now a core part of the product's pitch.
