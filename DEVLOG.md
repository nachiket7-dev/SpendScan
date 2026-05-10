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
