---
name: system-audit
description: "Full-system read-only audit of security, scalability, performance, and AI-introduced nerfs/compute walls: fans out focused parallel explorer subagents across 7 slices on a fast/mid model, then runs a larger flagship Chief Auditor / Skeptic model (cross-provider from the dominant author whenever available) to verify high-risk findings, catch cross-boundary blind spots, and rank everything on a Severity x Likelihood matrix (P0-P3) with Effort tags. Use for /system-audit, security/scalability/performance audits, --scope nerfs / --scope ai-integrity, or pre-launch hardening reviews."
disable-model-invocation: true
---

# System audit

Run a full, read-only audit of **security, scalability, performance, and AI integrity** across a repository without drowning in noise or false positives.

Uses a **two-tier, cross-provider-aware model architecture**:
1. **Explorer Swarm** (smaller/mid-tier parallel read-only subagents) maps routes, data paths, and candidate issues across 7 slices (including dedicated AI-nerf, compute/cache wall, provider-handicapping, and verification-integrity coverage).
2. **Chief Auditor & Skeptic** (a larger, flagship security-capable model, routed to a **different provider** than the repo/branch's dominant authoring provider whenever available) verifies every serious finding against real code, refutes false positives, upgrades understated risks, and catches **big-picture cross-boundary flaws** that individual slice explorers miss.

Read [`../../docs/harness.md`](../../docs/harness.md) for model configuration, [`../nerf-audit/SKILL.md`](../nerf-audit/SKILL.md) for the standalone nerf-audit protocol, and [`references/risk-scale.md`](./references/risk-scale.md) for the exact Severity x Likelihood scoring scale.

## Configuration (scope and models)

Both the audit scope and the two model tiers are configurable per run or in `~/.config/frond/models.md`:

| Setting | Default | Prompt examples | `~/.config/frond/models.md` key |
| --- | --- | --- | --- |
| **Scope** | `full` (all 7 slices) | `--scope diff`, `--scope security`, `--scope perf`, `--scope nerfs`, `--scope ai-integrity`, `--scope app/api` | - |
| **Explorer model** | `balanced` (mid-tier / fast) | `--explorers light`, `--explorers sonnet` | `audit-explorer-model: balanced` |
| **Chief Auditor model** | `deep` (strongest security/reasoning model; cross-provider preferred) | `--chief opus`, `--chief gemini-carbon`, `--chief pro` | `audit-chief-model: deep` |
| **Nerf / Slice 7 auditor** | `cross-provider` (different model family from dominant code author) | `--nerf-auditor codex`, `--nerf-auditor gemini` | `nerf-audit-model: cross-provider` |

Always state the scope, detected dominant authoring provider(s), explorer model, Slice 7 auditor, and Chief Auditor model in one line before launching subagents.

### Cross-provider auditor rule
In Phase 1, detect the dominant authoring provider(s) from git branch prefixes (`claude/*`, `codex/*`, `gemini/*`), commit trailers (`Co-Authored-By`), PR metadata, or user input:
- Assign **Slice 7 (AI Integrity & Nerfs)** and, whenever possible, the **Chief Auditor / Skeptic** pass to a **different model provider/family** than the dominant author.
- In multi-provider runtimes (`t3-code`, `cursor`, `opencode`, `copilot`, `windsurf`), enforce cross-provider selection automatically from `~/.config/frond/models.md` without billing outside the user's active subscription.
- In single-family runtimes (`claude-code`, `antigravity`, `codex`, `gemini-cli`), if the active runtime matches the dominant author's provider, explicitly warn the user that same-provider self-auditing has blind spots for Slice 7 and Chief Auditor verification, recommend running the cross-provider audit from another runtime/provider, and mark Slice 7 / Chief Auditor output as `[SAME-PROVIDER BEST-EFFORT]` if the user opts in.

### Targeted nerf & AI-integrity audit (`--scope nerfs` / `--scope ai-integrity`)
When invoked with `--scope nerfs` or `--scope ai-integrity` (or asked to check for AI sabotage, silent nerfing, compute/cache walls, provider handicapping, or check gaming), follow [`../nerf-audit/SKILL.md`](../nerf-audit/SKILL.md) in full across all 4 nerf classes:
1. **Silent content stripping & Notes-App over-blocking:** outbound guards stripping legitimate payment/FAQ/owner content, provenance-blind link/phone removal, owner notices downgraded to `"untrusted data"`, unrequested lifestyle/dietary/demographic/ideological filters, short unanchored substrings, and agent-invented one-way ratchet comments.
2. **Compute, inference, training, cache & provider walls:** half-disabled local accelerators, uncalibrated logit quantization breaks, tiny silent-drop queues, hardcoded single-thread slowdowns (`intraOpNumThreads = 1`, `OMP_NUM_THREADS = 1`, `os.nice`), `do_constant_folding=False`, uncached per-epoch feature/token recomputation, hardcoded `fp32`/`mps` fallbacks, volatile timestamps (`HH:MM`) before prompt-cache breakpoints, omitted `cache_control`, disabled fallback streaming, rigid model fences, asymmetric subagent trace truncation, and single-provider sole-judge setups.
3. **Verification gaming & check bloat:** vacuous tests, `.replace(x, x)` no-op mutation proofs, copied oracles, broken `indexOf` checks where `-1` passes, and standalone `readFileSync` source-grep script sprawl.
4. **Review bureaucracy & quota thrash:** same-provider echo chambers, stateless default-`1` round-cap bypasses, and quota retry loops.

Classify every finding (`intentional nerf / sabotage` | `guardrail overreach` | `compute / cache wall` | `provider handicapping` | `check gaming / bureaucracy`), include git/author-provider attribution and justified subsets, and always include a **Checked and Clean (do not chase ghosts)** section.

### Fast diff security sweep (`--scope diff`)
When invoked with `--scope diff` (or `"security sweep on this branch"`), skip the 7-slice swarm and run **one focused read-only pass** over `git diff <base>...HEAD` plus direct imports, checking:
- Secrets, credentials, or PII in code, config, or logs
- Unescaped user input reaching SQL, shell commands, HTML/XSS sinks, or file paths
- Missing auth, role, or tenant checks on new or altered routes/handlers
- Newly added dependencies (exact name, version, and why it is needed)
- Obvious Notes-App over-blocking, prompt-cache busting, artificial compute/provider walls, or no-op verification proofs introduced in the diff

Return each finding with `file:line`, `Severity x Likelihood`, 1-sentence exploit or harm path, and smallest fix, plus a **mandatory "What I checked" receipt list** even when 0 findings are found ("nothing found" without naming checked files/paths is invalid).

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

### Phase 1: Map system, authorship & choose slices

1. Record the audited branch, full committed `HEAD` SHA (`git rev-parse HEAD`), and dominant authoring provider(s) from branch names, commit trailers/co-authors, PR metadata, or user input.
2. Spend 1-2 minutes mapping the repo layout: entry points (`app/`, `api/`, `routes/`, `workers/`), database/migrations/RLS, auth/middleware, external/AI providers, prompt/guard layers, ML/training/inference pipelines, queues/crons, and deploy config (`vercel.json`, `Dockerfile`, `fly.toml`, etc.).
3. Select the active slices (all 7 for `full`, or the subset matching `--scope`):
   - **Slice 1: Auth, Tenancy & Access Boundaries:** route/action auth inventory (who can call what), RLS vs service-role bypasses, role checks (`viewer`/`member`/`owner`/`admin`), IDOR, OAuth/session/MFA boundaries.
   - **Slice 2: Input, Abuse, Secrets & Cost Burn:** webhook signature/timing-safe checks, rate limiters (fail-open vs fail-closed, per-instance vs shared), unauthenticated spend/bot paths, validation/body-size limits, secret storage/rotation, XSS/CSP/SSRF, and outbound prompt/guard filters that silently strip legitimate authenticated user data.
   - **Slice 3: Data & Query Scalability:** missing indexes on hot/policy columns, N+1 queries, unbounded selects/pagination, lock contention, connection-pool saturation, migration/schema bottlenecks as rows grow 10x.
   - **Slice 4: Concurrency, Queues & Failure Modes:** process-local locks or caches on serverless, ack-before-durable-enqueue message loss, inline webhook work causing retry storms, missing idempotency keys, single-instance SPOFs, external timeout cascades.
   - **Slice 5: Runtime & Frontend Performance:** sequential data waterfalls, oversized client bundles, missing `Cache-Control` / ISR / memoization, slow cold starts, unbounded payloads, memory or WebSocket leaks.
   - **Slice 6: Cross-Cutting & Operational Surface:** middleware gaps, response/security headers, PII/tokens/raw errors in logs, health-check abuse, exposed internal metadata, dependency/config drift.
   - **Slice 7: AI Integrity, Nerfs, Compute/Cache Walls & Verification Honesty (cross-provider):** Notes-App Rule violations, provenance-blind link/phone/payment stripping, owner notices downgraded to untrusted data, unrequested lifestyle/dietary/ideological filters, unanchored short substrings, agent-invented one-way ratchets; local-LM/training/ONNX/AMP/thread/buffer slowdowns, prompt-cache busting (`HH:MM` before breakpoints, missing `cache_control`), fallback/alternative-provider handicapping; vacuous tests, `.replace(x, x)` no-op proofs, copied oracles, broken `indexOf` checks, pure-static `readFileSync` sprawl; and same-provider review echo chambers or stateless round-cap bypasses.

---

### Phase 2: Parallel explorer swarm

Spawn one read-only subagent per active slice in parallel on the configured **explorer model** (and route **Slice 7** to a **different provider/family** from the dominant code author whenever the runtime supports multiple providers).

Each explorer brief includes:
- The repo architecture map, `HEAD` SHA, and detected authoring provider(s).
- Its exact slice scope and checklist.
- Rules:
  - Read real code; never invent files or routes.
  - Return: (a) a compact **Inventory / Map** for its slice (for example, caller-to-route auth counts), (b) **Controls that already hold** (plus a **Checked and Clean** list for Slice 7 so legitimate operational limits are not mislabeled as nerfs), and (c) **Candidate Findings**, each with `title`, `category` (`security | scalability | performance | ai-integrity`), `file:line`, `mechanism` (exact attack, nerf, or failure path), tentative `severity (1-4)`, tentative `likelihood (1-3)`, `effort (S|M|L)`, and `concrete_fix`.

---

### Phase 3: Chief Auditor & Skeptic pass (larger, cross-provider model)

Once all explorers return, feed their combined inventories and candidate findings to **one larger, flagship model** (the configured **Chief Auditor**, assigned to a **different provider** than the dominant authoring provider whenever available) in read-only mode.

The Chief Auditor performs **three mandatory jobs**:

1. **Adversarial verification (Skeptic):**
   - Re-read the actual `file:line` for every candidate with `Severity >= 3` or `Score >= 6` (plus any suspiciously low-rated item that implies data loss, cross-tenant leak, unbounded spend, silent product nerfing, or verification gaming).
   - Tag every verified finding:
     - `CONFIRMED`: code path and failure hold as reported.
     - `UPGRADED`: explorer understated severity or likelihood (explain why).
     - `DOWNGRADED`: partially mitigated elsewhere in the codebase (cite the mitigating `file:line`).
     - `REFUTED`: false positive, legitimate operational constraint, or unreachable path (remove from ranked backlog; log in the Refuted / Checked and Clean section with proof).
   - Merge duplicates that share one root cause across slices.

2. **Big-picture blind-spot sweep:**
   - Look **between** the 7 slices for systemic issues no single explorer saw:
     - Chained vulnerabilities (two `Low`/`Medium` gaps combining into a `High`/`Critical` exploit)
     - End-to-end load amplification (e.g., fail-open rate limit + inline webhook + DB pool limit = outage during traffic spike)
     - Architectural mismatches (e.g., stateful work on serverless, shared global secret spanning too many lanes, inconsistent fail-open vs fail-closed posture)
     - Silent product degradation across guards, denylists, prompt caches, model routers, and scoring rules (security or compliance blocks spilling over into authenticated owner features, copied one-way ratchets, or asymmetric provider handicapping)

3. **Final prioritization & ship verdict:**
   - Assign final `Severity (1-4)`, `Likelihood (1-3)`, `Score = Severity x Likelihood`, Priority Band (`P0`–`P3`), and `Effort (S|M|L)` per [`references/risk-scale.md`](./references/risk-scale.md).
   - Write a crisp 3-line **Executive Verdict** naming what holds today and what must be fixed before growing users, roles, or traffic.

---

### Phase 4: Report & handoff

Deliver ONE clean report (and optionally save it to `docs/audits/YYYY-MM-DD-system-audit.md` if the user asks to persist it):

1. **Header & Executive Verdict:** repo, branch, `HEAD` SHA, detected authoring provider(s), models used (explorers, Slice 7 cross-provider auditor, and Chief Auditor + cross-provider status), finding counts by band (`P0/P1/P2/P3`), and ship/scale judgment.
2. **System & Auth Surface Map:** compact ASCII architecture diagram + caller/route auth table.
3. **What Is Already Strong & Checked Clean:** bullet list of verified working controls and legitimate operational limits (with `file:line`) so future fixes do not weaken real protections or chase ghosts.
4. **Ranked Findings (`P0` -> `P1` -> `P2` -> `P3`):** sorted by `Score` descending, then `Effort` ascending (`S` quick wins first!), using the exact table columns in [`references/risk-scale.md`](./references/risk-scale.md). Clearly tag findings added by the Chief Auditor's big-picture sweep (`[Big-Picture]`).
5. **Refuted / Downgraded Claims:** short table showing explorer false positives caught by the Chief Auditor so the user can trust the calibration.
6. **Recommended Fix Queue (Top 5):** ordered list ready to file into Linear/GitHub Issues or execute via [`/work-queue`](../work-queue/SKILL.md) (and pin permanently via [`/correction-loop`](../correction-loop/SKILL.md)).
