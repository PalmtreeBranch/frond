# Risk scale & report format for `/system-audit`

Use this 2D **Severity x Likelihood** scale instead of vague gut labels or heavy enterprise CVSS formulas. Every finding gets two explicit numbers, one product score (`1–12`), one Priority Band (`P0–P3`), and an Effort size (`S`/`M`/`L`).

## 1. Severity (Impact if triggered: `1–4`)

| Score | Label | Security | Scalability / Reliability | Performance |
| --- | --- | --- | --- | --- |
| **4** | **Critical** | Unauthenticated cross-tenant/admin breach, RCE, leaked prod secrets, unbounded spend/cost burn | Silent data loss/corruption, full production outage under realistic load | Total request timeout/hang blocking core user path |
| **3** | **High** | Authenticated privilege escalation (e.g., viewer mutating data), bounded abuse/cost burn, PII leak | Core flow fails under modest growth (5–10x load) or single vendor slowdown | Severe latency (>3–5s p95) or memory leak crashing workers |
| **2** | **Medium** | Hardening gap needing a second failure or leaked credential, missing defense-in-depth header/CSP | N+1 or missing index that degrades steadily as tables grow | Noticeable UI/API sluggishness (1–3s), oversized bundle, missing cache headers |
| **1** | **Low** | Minor info disclosure (version/SHA), theoretical edge case, stale security doc | Inefficiency only relevant at 100x+ scale | Micro-optimization with negligible user impact |

## 2. Likelihood (Probability of hitting in the next 3–6 months: `1–3`)

| Score | Label | Criteria |
| --- | --- | --- |
| **3** | **High (Likely)** | Exploitable anonymously on the public internet with no credentials, **OR** triggered automatically by normal user behavior and steady growth (missing index on hot table, process-local lock on serverless, unthrottled public route). |
| **2** | **Medium (Plausible)** | Requires a signed-in user/partner account, a realistic 5–10x traffic spike, a vendor timeout/retry burst, or a common configuration state. |
| **1** | **Low (Rare / Hard)** | Requires an already-compromised internal secret, chaining multiple uncommon preconditions, or extreme scale far beyond current roadmap. |

## 3. Priority bands (`Score = Severity x Likelihood`)

| Band | Rule | Action |
| --- | --- | --- |
| **`P0`: Fix Now** | `Score 9–12`, **or** any `Severity 4` with `Likelihood >= 2` | Block expansion (new tiers, roles, or major traffic growth) until fixed. |
| **`P1`: Next Sprint** | `Score 6–8` | High real-world leverage; queue into `/work-queue` right after P0s. |
| **`P2`: Plan & Harden** | `Score 3–5` | Fix when touching the subsystem or ahead of the next scaling milestone. |
| **`P3`: Monitor / Backlog** | `Score 1–2` | Defense-in-depth; log once and do not distract current shipping. |

### Tie-breaking & Effort tags
Sort findings by: **Band (`P0` -> `P3`) -> Score (`12` -> `1`) -> Severity (`4` -> `1`) -> Effort (`S` -> `M` -> `L`)** so fast, high-impact fixes float to the very top.

- **`S` (Small):** < 2 hours, isolated helper/index/config/guard fix.
- **`M` (Medium):** 0.5–2 days, touches a flow, migration, or multiple routes.
- **`L` (Large):** multi-day architectural shift (queueing, secret split, auth refactor).

---

## 4. Finding table template

```markdown
| ID | Band | Score (S×L) | Area | Finding | Location | Attack / Failure Mode | Concrete Fix | Effort | Skeptic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SA-01 | P0 | 12 (4×3) | Security | Unthrottled public session mint burns AI budget | `app/api/chat/session/route.ts:27` | Anonymous scraper rotates sessions to bypass per-session cap and exhaust venue quota | Add Turnstile + fail-closed shared per-IP rate limit | M | CONFIRMED |
| SA-02 | P1 | 6 (3×2) | Scalability | Inline webhook work triggers retry storms `[Big-Picture]` | `app/api/webhooks/billing/route.ts:140` | Slow DB during spike exceeds vendor 5s timeout, causing duplicate retries that saturate pool | Persist receipt, enqueue async job, return 200 immediately | M | BIG-PICTURE |
```
