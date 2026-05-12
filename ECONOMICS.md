# ECONOMICS.md — Unit Economics

## Cost Structure

### Fixed Costs (Monthly)

| Item | Cost | Notes |
|------|------|-------|
| Vercel Pro | $20/mo | Hosting, edge functions |
| Supabase Free Tier | $0 | 500MB, 50K rows, RLS |
| Resend Free Tier | $0 | 3,000 emails/month |
| Domain (spendscan.credex.rocks) | $0 | Subdomain of existing Credex domain |
| **Total fixed** | **$20/mo** | |

### Variable Costs (Per Audit)

| Item | Cost per audit | Notes |
|------|---------------|-------|
| Anthropic API (AI summary) | ~$0.003 | ~200 tokens out × $15/MTok (Sonnet) |
| Vercel function invocation | ~$0.0001 | Included in Pro plan up to 1M |
| Supabase storage | ~$0 | <1KB per audit row |
| Resend email | ~$0 | Free tier covers first 3K/mo |
| **Total variable** | **~$0.003/audit** | |

### Breakeven Analysis

At $20/mo fixed cost and $0.003/audit variable cost:
- **Cost per 1,000 audits:** $20.00 + $3.00 = $23.00
- **Cost per 10,000 audits:** $20.00 + $30.00 = $50.00

## Revenue Model

SpendScan is a **lead-generation tool**, not a revenue product. Value is measured in qualified leads for Credex, not direct revenue.

### Lead Value Estimation

| Metric | Value | Source |
|--------|-------|--------|
| Audit → Email capture rate | ~15% (estimated) | Industry avg for value-first tools |
| Email → Credex consultation | ~10% (estimated) | High-intent leads |
| Consultation → Customer | ~25% (industry avg) | SaaS sales benchmarks |
| Average Credex deal size | ~$500/mo | Credit marketplace avg |
| Customer LTV (12 months) | ~$6,000 | $500 × 12 months |

### Funnel Math (per 1,000 audits)

```
1,000 audits
  → 150 email captures (15%)
  → 15 Credex consultations (10%)
  → 3.75 customers (25%)
  → $22,500 LTV (3.75 × $6,000)
```

**Cost to generate $22,500 LTV:** $23.00

**ROI:** ~978x (if organic traffic, no paid acquisition)

### With Paid Acquisition

If we assume $2 CPC on technical LinkedIn ads:
- Cost per 1,000 visitors: $2,000
- Visitor → Audit completion: ~40%
- Cost per 400 audits: $2,000
- **CAC per customer:** $2,000 / (400 × 0.15 × 0.10 × 0.25) = ~$1,333
- **LTV:CAC ratio:** 6,000 / 1,333 = **4.5x** ✓ (healthy)

## Scaling Costs

| Scale | Monthly cost | Notes |
|-------|-------------|-------|
| 100 audits/mo | $20 | Free tier covers everything |
| 1,000 audits/mo | $23 | Still on free tiers |
| 10,000 audits/mo | $70 | Supabase Pro ($25), Resend Pro ($20), Anthropic ~$30 |
| 100,000 audits/mo | $400 | Need Redis for rate limiting, higher Anthropic spend |
