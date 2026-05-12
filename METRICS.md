# METRICS.md — KPIs and Success Criteria

## Primary KPIs

| Metric | Definition | Target (30 days) | Target (90 days) |
|--------|-----------|-------------------|-------------------|
| **Completed Audits** | User submits form and sees results | 500 | 5,000 |
| **Email Captures** | User submits lead capture form | 100 | 750 |
| **Capture Rate** | Emails / Completed Audits | 15%+ | 20%+ |
| **Credex Consultations** | Clicks on "Book a consultation" CTA | 10 | 50 |
| **Shared Audits** | Unique shareable URLs generated | 50 | 500 |

## Funnel Metrics

```
Landing Page Visit
  ↓ [Start audit click-through rate]
Form Started
  ↓ [Form completion rate]
Audit Completed (results shown)
  ↓ [Email capture rate]
Lead Captured
  ↓ [Share rate]
Audit Shared (viral loop)
  ↓ [Credex CTA click rate — high savings only]
Credex Consultation Booked
```

### Target Conversion Rates

| Funnel Step | Target | Notes |
|------------|--------|-------|
| Visit → Form start | 40% | Landing page CTA effectiveness |
| Form start → Completion | 70% | Form is short (2-3 min) |
| Completion → Email capture | 15% | Value-first, email is optional |
| Email capture → Share | 30% | Shareable link prominently displayed |
| High savings → Credex CTA click | 20% | Only shown for >$500/mo savings |

## Engagement Metrics

| Metric | Target | Why it matters |
|--------|--------|---------------|
| **Time on results page** | >60s | Users reading recommendations = trust |
| **AI summary load rate** | >95% | Fallback should rarely be needed |
| **Share URL visits** | 2+ per shared audit | Viral coefficient measurement |
| **Return visits** | 10%+ within 30 days | Tool is sticky enough to revisit |
| **Mobile completion rate** | Within 80% of desktop | Mobile layout must not be a barrier |

## Technical Health Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | >90 | Chrome DevTools |
| Lighthouse Accessibility | >90 | Chrome DevTools |
| Build time | <30s | Vercel dashboard |
| API response time (summary) | <3s | Anthropic API |
| API response time (leads) | <500ms | Supabase + Resend |
| Test coverage | 100% of audit engine branches | Vitest coverage |
| CI pass rate | >99% | GitHub Actions |

## Credex Business Impact

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Qualified leads from SpendScan | 10+ | 30 days |
| Credex revenue attributable to SpendScan | $5,000+ | 90 days |
| Average deal size from SpendScan leads | $500+/mo | Ongoing |
| SpendScan-sourced customer retention | >80% at 6 months | 6 months |

## Alerting Thresholds

| Alert | Trigger | Action |
|-------|---------|--------|
| Build failure | CI fails on main | Fix immediately |
| Audit completion drop | <10/day after launch | Check for UX regression |
| Email capture rate drop | <10% for 7 days | A/B test form placement |
| API error rate spike | >5% of summary requests fail | Check Anthropic status, verify fallback |
| Rate limit triggers | >100/day | Investigate potential abuse |
