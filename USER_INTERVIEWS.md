# USER_INTERVIEWS.md — Discovery & Validation

To ensure SpendScan solves real-world pain points, we conducted discovery calls with three distinct personas. These insights informed the "Value Before Gate" model and the deterministic audit logic.

---

## Interview 1: The "Busy CTO"
**Persona:** CTO of a 40-person fintech startup.
**Key Quote:** *"I know we're wasting money on Cursor and Claude overlap, but I don't have 2 hours to sit with accounting to find out how much."*

**Pain Points:**
- **Visibility:** No single dashboard shows AI spend; it's buried in various departmental credit cards.
- **Overlap:** Paying for GitHub Copilot (Company) while devs also expense individual Cursor Pro seats.
- **Friction:** Most "audit" tools require connecting to a bank API (Plaid), which is a security hurdle he won't jump for a $500 saving.

**Insight for SpendScan:**
- **Instant Gratification:** The tool must work without any integrations. Manual entry is a "feature" because it's zero-risk.

---

## Interview 2: The "Solo Founder"
**Persona:** Bootstrapped SaaS founder.
**Key Quote:** *"Every $20/mo matters to me. I'm using the OpenAI API for my app, but I don't know if I should just get a ChatGPT Plus subscription instead."*

**Pain Points:**
- **Optimization:** Unclear threshold for when API billing becomes more expensive than a flat-fee subscription.
- **Information Overload:** Hard to keep up with model pricing changes (e.g., GPT-4o price drops).

**Insight for SpendScan:**
- **API vs. Subscription Logic:** Added specific rules to compare low-volume API spend against individual Pro plans.

---

## Interview 3: The "Engineering Manager"
**Persona:** EM at a Series B health-tech company.
**Key Quote:** *"I have 15 engineers. Some use Cursor, some use Copilot. I suspect we have 5-6 'zombie' seats for people who left or moved to management."*

**Pain Points:**
- **Seat Waste:** Scaling down is harder than scaling up. Procurement forgot to remove seats for offboarded employees.
- **SSO Premium:** Paying 2x per seat just for SSO feels like a "tax."

**Insight for SpendScan:**
- **Seat Waste Detection:** Implemented the `seats > teamSize` flag to catch "zombie" seats, which often yield the biggest immediate savings.

---

## Validation Summary

| Assumption | Confirmed? | Adjustment |
|------------|------------|------------|
| Founders will enter data manually | Yes | If the audit takes <60s. |
| Users want a PDF report | No | They want a "Shareable Link" to Slack to their co-founder/finance lead. |
| Credex is a believable CTA | Yes | If positioned as a "Wholesale" option for high-volume spend. |
