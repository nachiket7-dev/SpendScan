# SpendScan — Free AI Tool Spend Audit

> Find out if you're overpaying for AI tools. Instant audit, no signup required.

SpendScan is a free web app for startup founders and engineering managers. Enter your AI tool subscriptions — get a per-tool breakdown with defensible savings recommendations in under 60 seconds.

Built as a lead-generation asset for [Credex](https://credex.rocks).

---

## Screenshots

> Add 3+ screenshots or a Loom link here before submission

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/ai-spend-audit
cd ai-spend-audit
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Run tests

```bash
npm run test
```

### Deploy

```bash
npx vercel --prod
```

---

## Live URL

https://spendscan.credex.rocks

---

## Decisions

1. **Hardcoded audit rules, not AI.** Every recommendation is a deterministic rule. This makes the logic testable and honest. AI is only used for the 100-word summary.

2. **Total monthly spend as input, not per-seat.** Users see a total invoice number. Asking per-seat requires mental math. The engine infers per-seat from the seats field.

3. **No login before value.** Email gate is a button on the results page, never a gate to see the audit.

4. **Zustand over Context API.** The persist middleware handles localStorage in 2 lines vs 40+ with useEffect.

5. **CSS variables + Tailwind.** Design tokens need to be referenced in inline styles (dynamic tool colors). CSS variables coexist cleanly with Tailwind utilities.
# SpendScan
