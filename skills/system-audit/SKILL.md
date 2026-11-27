---
name: system-audit
description: "Full-system read-only audit of security, scalability, and performance: fans out focused parallel explorer subagents on a fast/mid model, then runs a larger flagship Chief Auditor / Skeptic model to verify high-risk findings, catch cross-boundary blind spots, and rank everything on a Severity x Likelihood matrix (P0-P3) with Effort tags. Use for /system-audit, security/scalability/performance audits, or pre-launch hardening reviews."
disable-model-invocation: true
---

# System audit

Run a full, read-only audit of **security, scalability, and performance** across a repository without drowning in noise or false positives.

Uses a **two-tier model architecture**:
1. **Explorer Swarm** (smaller/mid-tier parallel read-only subagents) maps routes, data paths, and candidate issues across 6 slices.
2. **Chief Auditor & Skeptic** (a larger, flagship security-capable model) verifies every serious finding against real code, refutes false positives, upgrades understated risks, and catches **big-picture cross-boundary flaws** that individual slice explorers miss.

Read [`../../docs/harness.md`](../../docs/harness.md) for model configuration and [`references/risk-scale.md`](./references/risk-scale.md) for the exact Severity x Likelihood scoring scale.

## Configuration (scope and models)

Both the audit scope and the two model tiers are configurable per run or in `~/.config/frond/models.md`:

| Setting | Default | Prompt examples | `~/.config/frond/models.md` key |
| --- | --- | --- | --- |
| **Scope** | `full` (all 6 slices) | `--scope diff`, `--scope security`, `--scope perf`, `--scope ai-integrity`, `--scope app/api` | - |
| **Explorer model** | `balanced` (mid-tier / fast) | `--explorers light`, `--explorers sonnet` | `audit-explorer-model: balanced` |
| **Chief Auditor model** | `deep` (strongest security/reasoning model) | `--chief opus`, `--chief gemini-carbon`, `--chief pro` | `audit-chief-model: deep` |

Always state the scope, explorer model, and Chief Auditor model in one line before launching subagents.

### AI & user-intent integrity audit (`--scope ai-integrity`)
When invoked with `--scope ai-integrity` (or asked to check for AI sabotage, silent nerfing, or guardrail overreach), inspect agent prompts, outbound filters, denylists/allowlists, ML/scoring weights, model routers, and check suites across the codebase:
- **Preference & ideological integrity:** check for hidden rules overriding user/customer/owner inputs, lifestyle or demographic categories misclassified as sensitive blocks, or silent degradation in ML/scoring/ranking pipelines instead of explicit refusals.
- **Notes-app over-blocking:** check where security guards drop benign authenticated owner facts (links, phone numbers, catalog URLs, accepted payment methods) or use unanchored short substrings with false positives on ordinary domain text.
- **Check & eval honesty:** scan tests, mutation scripts, and benchmark runners for vacuous assertions, self-replacing no-op mutations (`.replace(a, a)`), copied-oracle checks, or hidden model favoritism.

Return each finding as intentional sabotage vs guardrail overreach vs check gaming, with `file:line`, concrete user harm, and whether a documented safety/compliance reason justifies keeping part of the rule.

### Fast diff security sweep (`--scope diff`)
When invoked with `--scope diff` (or `"security sweep on this branch"`), skip the 6-slice swarm and run **one focused read-only pass** over `git diff <base>...HEAD` plus direct imports, checking:
- Secrets, credentials, or PII in code, config, or logs
- Unescaped user input reaching SQL, shell commands, HTML/XSS sinks, or file paths
- Missing auth, role, or tenant checks on new or altered routes/handlers
- Newly added dependencies (exact name, version, and why it is needed)

Return each finding with `file:line`, `Severity x Likelihood`, 1-sentence exploit path, and smallest fix, plus a **mandatory "What I checked" receipt list** even when 0 findings are found ("nothing found" without naming checked files/paths is invalid).

## Hard rules

1. **Strictly read-only.** Never edit application code, run migrations, hit production write endpoints, or leak secrets/PII in the report.
2. **Every finding needs code proof.** Require exact `file:line`, concrete attack or failure mechanism, and impact. Drop vague "best practice" filler with no real code path.
3. **Name what is already strong.** Record controls that already hold (RLS, webhook HMAC, idempotency keys, caching) so future fixes never weaken them.
4. **Rank by real risk, not paranoia.** Score every finding on **Severity (1-4) x Likelihood (1-3)** + **Effort (`S`/`M`/`L`)** per [`references/risk-scale.md`](./references/risk-scale.md).

---

## Workflow

Open a checklist with these four phases:
1. Map system & choose slices
2. Parallel explorer swarm
3. Chief Auditor skeptic & big-picture pass
4. Ranked audit report & handoff

---

### Phase 1: Map system & choose slices

1. Record the audited branch and full committed `HEAD` SHA (`git rev-parse HEAD`).
2. Spend 1-2 minutes mapping the repo layout: entry points (`app/`, `api/`, `routes/`, `workers/`), database/migrations/RLS, auth/middleware, external providers, queues/crons, and deploy config (`vercel.json`, `Dockerfile`, `fly.toml`, etc.).
3. Select the active slices (all 6 for `full`, or the subset matching `--scope`):
   - **Slice 1: Auth, Tenancy & Access Boundaries:** route/action auth inventory (who can call what), RLS vs service-role bypasses, role checks (`viewer`/`member`/`owner`/`admin`), IDOR, OAuth/session/MFA boundaries.
   - **Slice 2: Input, Abuse, Secrets & Cost Burn:** webhook signature/timing-safe checks, rate limiters (fail-open vs fail-closed, per-instance vs shared), unauthenticated spend/bot paths, validation/body-size limits, secret storage/rotation, XSS/CSP/SSRF, and outbound prompt/guard filters that silently strip legitimate authenticated user data.
   - **Slice 3: Data & Query Scalability:** missing indexes on hot/policy columns, N+1 queries, unbounded selects/pagination, lock contention, connection-pool saturation, migration/schema bottlenecks as rows grow 10x.
   - **Slice 4: Concurrency, Queues & Failure Modes:** process-local locks or caches on serverless, ack-before-durable-enqueue message loss, inline webhook work causing retry storms, missing idempotency keys, single-instance SPOFs, external timeout cascades.
   - **Slice 5: Runtime & Frontend Performance:** sequential data waterfalls, oversized client bundles, missing `Cache-Control` / ISR / memoization, slow cold starts, unbounded payloads, memory or WebSocket leaks.
   - **Slice 6: Cross-Cutting & Operational Surface:** middleware gaps, response/security headers, PII/tokens/raw errors in logs, health-check abuse, exposed internal metadata, dependency/config drift, silent AI preference overrides or ML/scoring degradation, and vacuous or self-replacing verification checks.

---

### Phase 2: Parallel explorer swarm

Spawn one read-only subagent per active slice in parallel on the configured **explorer model**.

Each explorer brief includes:
- The repo architecture map and `HEAD` SHA.
- Its exact slice scope and checklist.
- Rules:
  - Read real code; never invent files or routes.
  - Return: (a) a compact **Inventory / Map** for its slice (for example, caller-to-route auth counts), (b) **Controls that already hold**, and (c) **Candidate Findings**, each with `title`, `category` (`security | scalability | performance`), `file:line`, `mechanism` (exact attack or failure path), tentative `severity (1-4)`, tentative `likelihood (1-3)`, `effort (S|M|L)`, and `concrete_fix`.

---

### Phase 3: Chief Auditor & Skeptic pass (larger model)

Once all explorers return, feed their combined inventories and candidate findings to **one larger, flagship model** (the configured **Chief Auditor**, e.g. a strong cybersecurity/reasoning model) in read-only mode.

The Chief Auditor performs **three mandatory jobs**:

1. **Adversarial verification (Skeptic):**
   - Re-read the actual `file:line` for every candidate with `Severity >= 3` or `Score >= 6` (plus any suspiciously low-rated item that implies data loss, cross-tenant leak, or unbounded spend).
   - Tag every verified finding:
     - `CONFIRMED`: code path and failure hold as reported.
     - `UPGRADED`: explorer understated severity or likelihood (explain why).
     - `DOWNGRADED`: partially mitigated elsewhere in the codebase (cite the mitigating `file:line`).
     - `REFUTED`: false positive or unreachable path (remove from ranked backlog; log in the Refuted section with proof).
   - Merge duplicates that share one root cause across slices.

2. **Big-picture blind-spot sweep:**
   - Look **between** the 6 slices for systemic issues no single explorer saw:
     - Chained vulnerabilities (two `Low`/`Medium` gaps combining into a `High`/`Critical` exploit)
     - End-to-end load amplification (e.g., fail-open rate limit + inline webhook + DB pool limit = outage during traffic spike)
     - Architectural mismatches (e.g., stateful work on serverless, shared global secret spanning too many lanes, inconsistent fail-open vs fail-closed posture)
     - Silent product degradation across guards, denylists, and scoring rules (security or compliance blocks spilling over into normal authenticated user features, or copied one-way ratchets propagation)

3. **Final prioritization & ship verdict:**
   - Assign final `Severity (1-4)`, `Likelihood (1-3)`, `Score = Severity x Likelihood`, Priority Band (`P0`–`P3`), and `Effort (S|M|L)` per [`references/risk-scale.md`](./references/risk-scale.md).
   - Write a crisp 3-line **Executive Verdict** naming what holds today and what must be fixed before growing users, roles, or traffic.

---

### Phase 4: Report & handoff

Deliver ONE clean report (and optionally save it to `docs/audits/YYYY-MM-DD-system-audit.md` if the user asks to persist it):

1. **Header & Executive Verdict:** repo, branch, `HEAD` SHA, models used (explorers + Chief Auditor), finding counts by band (`P0/P1/P2/P3`), and ship/scale judgment.
2. **System & Auth Surface Map:** compact ASCII architecture diagram + caller/route auth table.
3. **What Is Already Strong:** bullet list of verified working controls with `file:line`.
4. **Ranked Findings (`P0` -> `P1` -> `P2` -> `P3`):** sorted by `Score` descending, then `Effort` ascending (`S` quick wins first!), using the exact table columns in [`references/risk-scale.md`](./references/risk-scale.md). Clearly tag findings added by the Chief Auditor's big-picture sweep (`[Big-Picture]`).
5. **Refuted / Downgraded Claims:** short table showing explorer false positives caught by the Chief Auditor so the user can trust the calibration.
6. **Recommended Fix Queue (Top 5):** ordered list ready to file into Linear/GitHub Issues or execute via [`/work-queue`](../work-queue/SKILL.md) (and pin permanently via [`/correction-loop`](../correction-loop/SKILL.md)).
