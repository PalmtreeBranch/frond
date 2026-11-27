---
name: business-value
description: "Evaluate whether an idea, open issue, or stuck in-progress task has real business value now, for upcoming scale (growth trajectory over the next 1-3 months, not just today's static volume), or should be simplified, deferred with a trigger, or skipped/stopped. Checks connected analytics (PostHog, Google Analytics, Vercel, Plausible, DB usage) and roadmap context before giving a founder verdict. Use for /business-value, prioritizing an issue, or deciding whether to keep going when stuck."
disable-model-invocation: true
---

# Business value

Evaluate whether a feature, fix, open issue, or stuck in-progress task is actually worth building now, worth building for upcoming scale, worth cutting down to a smaller version, or worth skipping or stopping.

Do not judge from static "today only" volume, and do not validate every idea to be polite. Ground the call in real usage data, growth trajectory, effort, and opportunity cost.

## When to run it

- **Before building:** on a feature idea, Linear/GitHub issue, or backlog item.
- **When stuck mid-task:** before burning another half-day on a rabbit hole, check whether continuing still has positive business value or whether to stop or simplify.
- **Pairs with:** [`../feature-fit/SKILL.md`](../feature-fit/SKILL.md) (`business-value` decides *whether* it is worth doing for the business; `feature-fit` decides *where and how* it fits in the UI).

---

## Step 1: Gather real evidence (read-only)

Inspect what is actually connected before forming an opinion. Never invent numbers; mark missing data as `unknown`.

1. **Current usage & analytics (check what is available):**
   - Connected analytics tools or MCP servers (PostHog, Google Analytics, Vercel Analytics, Plausible, Mixpanel, Amplitude, Sentry).
   - Read-only database or billing usage signals (active accounts, feature adoption, error volume, support/churn mentions) when authorized and safe.
   - Issue tracker signals (Linear or GitHub Issues: how many customers asked for this, whether it is blocking a live deal or causing repeat support work).
2. **Growth trajectory & roadmap (critical):**
   - Never dismiss an item just because today's count looks small (for example, "only 15 calls/day right now").
   - Check the **rate of change** over the last 30 to 90 days AND any stated growth plan, launch milestone, or target (for example, "15 calls/day today, ramping to 150 calls/day in 2 months").
   - If trajectory or near-term targets are not in analytics, `PRODUCT.md`, or Linear milestones, ask the user **one** short question before finalizing a `DEFER` or `SKIP` call.
3. **Effort, maintenance, and opportunity cost:**
   - Estimate rough build effort (`S`: < 2h, `M`: 0.5-2d, `L`: 3+ days) and ongoing maintenance burden.
   - Check what higher-leverage issues sit in the backlog right now. If running mid-task while stuck, ignore sunk cost and judge only **remaining effort vs remaining value**.

---

## Step 2: Score the four business levers

Evaluate the item cleanly against these four questions:

1. **Revenue, retention, or trust impact:** Does this win deals, prevent churn, stop money/credit burn, protect customer trust (bookings, billing, data integrity), or save real founder/support hours every week?
2. **Current usage vs 90-day trajectory:** Are people using this surface today, or will near-term growth (next 1 to 3 months) turn this into a real bottleneck, support flood, or expensive rewrite if postponed?
3. **Cost of waiting:** If we skip this for 60 days, what breaks? (Nothing? Minor annoyance? Lost customers? Painful data migration later?)
4. **Cheaper 20% alternative:** Is there a 1-hour code default, copy tweak, manual ops step, or smaller cut that captures 80% of the business value?

---

## Step 3: Deliver one concrete verdict

Pick **exactly one** verdict:

| Verdict | Meaning |
| --- | --- |
| **`BUILD NOW`** | Clear value for active users, revenue, retention, or conversion today. |
| **`BUILD NOW (CRITICAL FIX)`** | Active bug, trust breach, data/billing/booking risk, or blocker hurting real accounts. |
| **`BUILD NOW FOR UPCOMING SCALE`** | Low volume today, but real growth trajectory or planned 1-3 month scale makes building it now far cheaper and safer than waiting. |
| **`SIMPLIFY (20% VERSION)`** | The full scope is overbuilt; ship a much smaller default or narrow slice that gets most of the value. |
| **`DEFER (SET A TRIGGER)`** | Not worth building at today's or near-term trajectory. Name the exact measurable trigger to revisit it (for example: "revisit at 50 paying customers or 100 calls/day"). |
| **`SKIP / STOP`** | Unused surface, weak value, or a sunk-cost trap while stuck. Close/archive the issue or stop the current branch and move to higher-leverage work. |

---

## Output format

Keep the response crisp and decidable in 30 seconds:

```markdown
## Business value verdict: `<VERDICT>`

**Item:** <issue, idea, or stuck task>
**Effort:** `<S | M | L>` (remaining effort if mid-task)

### Evidence checked
- **Current usage:** <real numbers from PostHog/GA/DB/issues, or "not connected / unknown">
- **Trajectory (1-3 months):** <growth trend or planned milestone that changes the math>
- **Cost of waiting 60 days:** <concrete consequence>

### Reasoning
<2-4 short sentences connecting usage, trajectory, and effort. No fluff.>

### Recommendation
- **Action:** <build, narrow to X, defer until trigger Y, or stop/close>
- **If continuing:** <optional next skill, e.g. /feature-fit, /sharpen, or /work-queue>
```
