# SpendScan — Free AI Tool Spend Audit

> Find out if you're overpaying for AI tools. Instant audit, no signup required.

SpendScan is a free web app for startup founders and engineering managers. Enter your AI tool subscriptions — get a per-tool breakdown with defensible savings recommendations in under 60 seconds.

Built as a lead-generation asset for [Credex](https://credex.rocks).

---

## Features

- **8 AI tools covered:** Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
- **Rule-based audit engine:** Deterministic, testable, finance-defensible — no black-box AI in the evaluation logic
- **AI-powered summary:** Personalized 100-word summary via Anthropic API (with templated fallback)
- **Shareable URLs:** Unique public link per audit with OG/Twitter card meta tags
- **Lead capture:** Email gate shown after value is delivered, with honeypot + rate limiting
- **Transactional email:** Audit report emailed via Resend on lead capture
- **Dark theme:** Syne display font, DM Sans body, monospace accents — distinctive, premium feel

---

## Quick Start

```bash
git clone https://github.com/nachiket7-dev/SpendScan.git
cd ai-spend-audit
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Environment Variables

```env
# Required for AI summary (falls back to template if missing)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Required for lead storage + shareable URLs
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for transactional email
RESEND_API_KEY=your_resend_key

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** The app works without any API keys — audit engine runs client-side, AI summary falls back to templates, lead capture gracefully degrades.

### Supabase Tables

Create these tables in your Supabase project:

```sql
CREATE TABLE audit_snapshots (
  id TEXT PRIMARY KEY,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  audit_id TEXT NOT NULL,
  audit_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Run Tests

```bash
npm run test              # run all tests
npm run test:coverage     # with coverage report
```

### Deploy

```bash
npx vercel --prod
```

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram, data flow, and stack decisions with tradeoffs.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Zustand · Vitest

**Key files:**
| File | Purpose |
|------|---------|
| `lib/audit-engine.ts` | Rule-based evaluation for all 8 tools |
| `lib/tools.ts` | Tool definitions, plans, pricing data |
| `lib/types.ts` | Shared TypeScript interfaces |
| `lib/store.ts` | Zustand store with localStorage persistence |
| `lib/fallback-summary.ts` | Templated summary fallback |
| `lib/supabase.ts` | Supabase wrapper for leads + audit snapshots |
| `lib/resend.ts` | Transactional email via Resend |
| `app/api/summary/route.ts` | Anthropic API for AI summaries |
| `app/api/leads/route.ts` | Lead capture with rate limiting + honeypot |
| `app/audit/[id]/page.tsx` | Shareable audit URL with OG tags |

---

## Decisions

1. **Hardcoded audit rules, not AI.** Every recommendation is a deterministic rule. This makes the logic testable and honest. AI is only used for the 100-word summary.

2. **Total monthly spend as input, not per-seat.** Users see a total invoice number. Asking per-seat requires mental math. The engine infers per-seat from the seats field.

3. **No login before value.** Email gate is a button on the results page, never a gate to see the audit.

4. **Zustand over Context API.** The persist middleware handles localStorage in 2 lines vs 40+ with useEffect.

5. **CSS variables + Tailwind.** Design tokens need to be referenced in inline styles (dynamic tool colors). CSS variables coexist cleanly with Tailwind utilities.

6. **No Supabase SDK.** Lightweight fetch wrapper instead — avoids ~50KB bundle for 3 API calls. Would switch to SDK for production.

7. **Fetch-based Anthropic API.** Direct fetch instead of `@anthropic-ai/sdk` — zero extra dependencies, simpler error handling, 10s timeout.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System diagram, data flow, stack decisions |
| [DEVLOG.md](./DEVLOG.md) | Daily development log (7 entries) |
| [REFLECTION.md](./REFLECTION.md) | 5 reflective questions |
| [GTM.md](./GTM.md) | Go-to-market strategy |
| [ECONOMICS.md](./ECONOMICS.md) | Unit economics and LTV analysis |
| [METRICS.md](./METRICS.md) | KPIs and success criteria |
| [PRICING_DATA.md](./PRICING_DATA.md) | Vendor pricing with source URLs |
| [TESTS.md](./TESTS.md) | Test descriptions and coverage targets |
| [PROMPTS.md](./PROMPTS.md) | AI prompts used in the project |
| [LANDING_COPY.md](./LANDING_COPY.md) | Landing page copy and messaging |

---

## Live URL

https://spendscan.credex.rocks

---

## License

MIT
