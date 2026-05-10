# TESTS.md

## How to run

```bash
npm run test           # run all tests
npm run test:coverage  # with coverage report
```

## Test files

### `__tests__/audit-engine.test.ts`

Covers the core audit engine — deterministic rule-based evaluation logic.

| Test | Description |
|------|-------------|
| `Cursor Business → downgrade to Pro (≤3 seats)` | Verifies that a 3-seat Business plan correctly flags $60/mo savings by downgrading to Pro |
| `Cursor Pro is optimal for coding team` | Verifies no false savings manufactured for an appropriate plan |
| `GitHub Copilot Enterprise → Business for <10 seats` | Verifies $100/mo savings for a 5-seat team on Enterprise |
| `ChatGPT + Claude overlap → consolidation` | Verifies cross-tool detection flags consolidation when both general chat AIs are paid |
| `Anthropic API >$500/mo → Credex credits` | Verifies the Credex recommendation triggers at high API spend |
| `Anthropic API <$100/mo small team → switch to Pro` | Verifies API-to-subscription recommendation for low-volume users |
| `Seat waste: seats > teamSize` | Verifies seat waste detection upgrades recommendation to reduce_seats |
| `Total savings sum across tools` | Verifies totalMonthlySavings, totalAnnualSavings, savingsCategory are computed correctly |
| `savingsCategory = high when savings >$500` | Verifies high-savings categorization triggers for Credex CTA |
| `savingsCategory = optimal when no savings` | Verifies honest "already optimal" path returns 0 savings |

## Minimum coverage targets

- Audit engine: 100% of tool branches covered
- Savings categorization: all 4 categories tested (high, medium, low, optimal)
- Cross-tool detection: overlap and seat waste both tested

## CI

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`.
See green check on the latest commit.
