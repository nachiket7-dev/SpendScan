# PROMPTS.md — AI Prompts Used in SpendScan

## 1. AI Summary Generation (Production — `app/api/summary/route.ts`)

This prompt runs in production via the Anthropic API to generate personalized audit summaries.

```
You are a concise financial analyst specializing in SaaS cost optimization. Write a personalized 80-100 word summary for a {teamSize}-person {useCase} team based on their AI tool spend audit.

Key findings:
- Total potential monthly savings: {totalMonthlySavings}
- Total potential annual savings: {totalAnnualSavings}
- Tools analyzed:
{toolSummaries — e.g., "- Cursor (Pro): Downgrade recommended (save $60/mo)"}

Rules:
- Be specific and reference actual tool names and dollar amounts
- Use a professional but approachable tone
- Lead with the most impactful finding
- If savings are $0, acknowledge they're spending wisely
- Do NOT use markdown formatting, bullet points, or headers — plain text only
- Do NOT mention Credex or any specific vendor recommendations beyond the tools listed
```

**Why this prompt works:**
- Constraining to 80-100 words prevents rambling
- "Plain text only" prevents formatting that would break the UI
- "Do NOT mention Credex" keeps the summary honest — the CTA is separate
- Injecting actual dollar amounts and tool names makes the output feel personalized, not generic

## 2. Development Assistance Prompts

### Architecture Planning
Used AI to help think through the audit engine data flow:
```
I'm building a rule-based audit engine for AI tool spend. The engine takes a list of tools with their current plan, seats, and monthly spend, plus a team size and primary use case. Help me think through edge cases: what if seats > team size? What if they're paying for both ChatGPT and Claude? What if they're on an Enterprise plan with custom pricing?
```

### Pricing Research
Used AI to cross-reference and verify pricing data:
```
What is the current pricing for GitHub Copilot as of 2025? I need: plan names, per-seat monthly costs, minimum seat requirements, and the official pricing page URL. Only include information you're confident is current.
```

### Test Case Design
Used AI to identify test scenarios:
```
I have an audit engine that evaluates AI tool subscriptions. What are the 5 most important test scenarios to cover? Consider: plan downgrades, cross-tool overlap, seat waste, API vs subscription tradeoffs, and edge cases like $0 savings.
```

## 3. Prompt Design Principles

1. **Structured input** — always inject the actual data into the prompt rather than asking the model to generate from vague context
2. **Negative constraints** — "Do NOT" rules prevent the most common failure modes
3. **Format constraints** — specifying "plain text only" or "80-100 words" keeps output predictable
4. **Role framing** — "You are a concise financial analyst" sets the right tone without being overly theatrical
5. **Fallback safety** — the system never depends on AI output being correct; there's always a templated fallback
