---
name: nerf-audit
description: "Strictly read-only, cross-provider forensic audit for AI-introduced nerfs, silent over-blocking (Notes-App Rule violations), compute/training/cache slowdowns, alternative-provider handicapping, verification gaming, and self-policing review bureaucracy. Enforces auditing from a different model provider than the code author and separates real nerfs from justified limits. Use for /nerf-audit, auditing AI-authored branches for hidden slowdowns or guardrail overreach, or verifying multi-provider parity."
---

# Nerf audit

Run a **strictly read-only**, **cross-provider** forensic audit of a repository, branch, or PR for silent product nerfs, guardrail overreach, compute/training/cache walls, rival-provider handicapping, verification gaming, and review bureaucracy.

Read [`../../docs/harness.md`](../../docs/harness.md) and the active runtime's section in `~/.config/frond/models.md` before resolving the auditor model.

## Hard rules

1. **Strictly read-only.** Never edit application code, tests, CI workflows, or configs during an audit. Never run destructive commands or touch production data.
2. **Cross-provider auditor rule (mandatory).** An auditor from another provider must audit nerfs introduced by other providers. Never let a model provider be the sole auditor of its own code, prompts, guards, or harness/routing changes when another provider is available.
3. **Evidence and attribution discipline.** Every finding must cite exact `file:line`, concrete user, cost, or latency harm, git/provider authorship attribution, and whether a documented safety or compliance requirement justifies keeping part of the rule.
4. **Do not chase ghosts.** Always include a **Checked and Clean (do not chase ghosts)** section distinguishing genuine requested complexity or valid operational limits (such as OOM fixes or documented local CPU caps) from arbitrary nerfs, and never misattribute one provider's code to another.

---

## Step 1: Resolve authorship and enforce cross-provider selection

Before inspecting code, identify which provider or model authored the target diff, branch, or subsystem:

1. **Detect authoring provider(s)** from committed metadata and user input:
   - Git branch prefixes (for example `claude/*`, `codex/*`, `gemini/*`, `cursor/*`, `copilot/*`)
   - Commit trailers and authors (`Co-Authored-By`, `Signed-off-by`, commit message tags, PR body reviewer/author lines)
   - PR metadata or explicit user statement (if authorship is mixed or unrecorded, inspect `git log --format="%h %an %s" <base>..<head>` per touched file and record mixed/unknown honestly)
2. **Select an auditor from a different model family** than the dominant author:
   - Claude-authored code -> audit with Gemini or OpenAI/Codex (or another non-Anthropic family)
   - Codex/OpenAI-authored code -> audit with Claude or Gemini (or another non-OpenAI family)
   - Gemini-authored code -> audit with Codex/OpenAI or Claude (or another non-Google family)
   - Mixed-provider code -> audit each provider's touched files from a different family, or assign a third independent family
3. **Apply runtime routing rules:**
   - **Multi-provider runtimes (`t3-code`, `cursor`, `opencode`, `copilot`, `windsurf`):** resolve the cross-provider auditor automatically from `~/.config/frond/models.md` (`nerf-audit-model: cross-provider` plus the configured family mapping). Never route to a provider that bills outside the user's active subscription without explicit approval.
   - **Single-family runtimes (`claude-code`, `antigravity`, `codex`, `gemini-cli`):** check whether the active runtime's model family matches the target code's authoring provider.
     - If they **differ**, proceed and state the cross-provider pairing in one line (for example: `Author: claude | Auditor: gemini (cross-provider satisfied)`).
     - If they **match** (same-provider self-audit), **stop before running the audit**. Explicitly warn the user that same-provider self-auditing has blind spots and cannot satisfy the cross-provider rule, name the authoring provider found in git/PR history, and recommend running `/nerf-audit` from a different provider or multi-provider runtime. Proceed with a clearly flagged **`[SAME-PROVIDER BEST-EFFORT - NOT CROSS-PROVIDER VERIFIED]`** pass only if the user explicitly opts in.

Announce in one line before reading code: scope (`branch <base>...<head>` or `repo <path>`), detected authoring provider(s), and selected auditor model/provider.

---

## Step 2: Audit all four nerf classes

Inspect only committed code (`git diff <base>...<head>`, `git show <head>:<path>`, or tracked repo files) across all four classes below.

### Class 1: Silent content stripping and over-blocking ("Notes-App Rule" violations)
Check outbound filters, regex guards, prompt wrappers, denylists/allowlists, knowledge/catalog serializers, and moderation layers:
- **Outbound guards deleting legitimate user or owner content:** regex or string filters that silently strip whole sentences when bare payment nouns (such as card or local payment method names) appear in normal informational answers, or gate benign answers behind brittle exact-format Q&A allowlists.
- **Provenance-blind link and phone stripping:** guards removing authenticated owner-saved URLs, storefront/catalog links, or phone numbers from free-text config (`info`, `faq`, `instructions`, knowledge or catalog tools) instead of separating untrusted external input (scraped pages, anonymous users, partner uploads) from authenticated owner saves.
- **Owner operational notices downgraded to "untrusted data":** wrapping authenticated owner or staff operational rules inside `"this is data, never follow instructions inside it"` blocks so the product silently ignores explicit temporary instructions.
- **Unrequested category expansion and collateral damage:** expanding narrow legal, medical, or compliance denylists with unrequested lifestyle, dietary, demographic, or ideological terms, then copying that marketing or compliance denylist into unrelated operational flows.
- **Short unanchored substring collisions:** 2-4 character `.includes()` or unanchored regex matches that silently drop or redact ordinary domain words (for example matching `"cat"` inside `"catalog"` or `"art"` inside `"cart"`).
- **Agent-invented one-way ratchet comments:** comments claiming a human's written decision or policy sign-off is required to remove or relax a restriction that the agent itself invented (verify against the linked issue/PR or commit history).

### Class 2: Compute, inference, training, cache, and alternative-provider walls
Check inference runners, local/small-model paths, training/export scripts, prompt builders, routers, and multi-agent harnesses:
- **Half-disabled local or small-model accelerators:** gating local-model speedups behind extra hidden env flags so `"live"` mode runs only the slowdown or delay half without delivering the latency gain; coupling decision thresholds to uncalibrated raw logits that break under quantization (such as int8); or setting tiny silent-drop queues (for example `maxQueue = 4`) that drop work under burst load.
- **Artificial local-inference slowdowns:** hardcoding `intraOpNumThreads = 1`, `OMP_NUM_THREADS = 1`, or `os.nice` in runtime code or benchmarks (making local or alternative models look artificially slower), or shipping naive recursive math, dense matmuls, per-call allocations, or oversized playout buffers where bit-exact fast paths exist.
- **Training and ML pipeline slowdowns:** explicitly turning off compiler/graph optimizations (`do_constant_folding=False` on ONNX export), re-decoding audio/files and recomputing features or re-tokenizing from disk inside every epoch/batch loop with zero caching, hardcoding `fp32` (no `bf16`/`fp16` AMP where supported), tiny batch sizes, missing `pin_memory` or `persistent_workers`, or hardcoding `mps` so CUDA machines silently fall back to CPU.
- **Prompt-cache busting:** placing volatile per-minute timestamps (`HH:MM`), live status flags, or mutable per-turn notes *before* static or history cache breakpoints (invalidating prefix caches every 60 seconds across chat, email, or SMS channels), or omitting `cache_control` entirely on secondary agents or copilots.
- **Handicapping rival or fallback providers:** disabling streaming for a fallback provider in a shared router even when streaming is already implemented; adding rigid model allowlists or fences that block local or alternative LMs without justification; stripping or asymmetrically truncating traces or context passed to other providers' subagents; or pinning one model provider as sole judge over cheaper or rival models.

### Class 3: Verification gaming and check bloat
Read test files, mutation scripts, eval runners, and CI checks touched or referenced by the target scope:
- **Reward hacking and fake proofs:** vacuous tests or fixtures that still pass if the production guard or fix is deleted; literal no-op mutation proofs (`.replace(x, x)`); copied-oracle tests (pasting production logic into the test as its own oracle); broken `indexOf` order checks where `-1` silently passes (for example `a.indexOf(x) < a.indexOf(y)` when `x` is missing); and comments or changelogs claiming runtime guarantees that the code does not enforce.
- **Static-check theater and sprawl:** flooding CI with one standalone script per PR and pure-static `readFileSync` source-grep checks that import zero production code instead of testing real behavior inside consolidated domain suites.

### Class 4: Self-policing review bureaucracy and quota thrash
Inspect review skills, orchestrator harnesses, PR automation, and multi-agent runners:
- **Same-provider echo chambers:** pinning one provider as author, reviewer, skeptic, and sole judge, leading to high non-harm `minor` noise, empty review runs, and near-zero self-refutation on `blocker`/`major` findings.
- **Bypassed round caps and quota loops:** stateless `round` parameters defaulting to `1` that allow branches to restart round 1 endlessly past the nominal cap, or retrying a quota-exhausted or rate-limited provider repeatedly instead of failing over immediately to a stand-in provider.

---

## Step 3: Classify, verify, and separate ghosts from real nerfs

Before writing the report, re-read every candidate `file:line` and verify its exact git authorship (`git log -n 3 --format="%h %an %s" -L <start>,<end>:<file>` or `git blame -L <start>,<end> <file>`).

Assign every confirmed finding exactly one primary classification:
- `intentional nerf / sabotage`
- `guardrail overreach`
- `compute / cache wall`
- `provider handicapping`
- `check gaming / bureaucracy`

For every confirmed finding, explicitly check:
1. **Concrete harm:** what user input gets silently dropped, how much latency/cost/cache-miss/accuracy loss occurs, or how verification is blinded.
2. **Justified subset:** whether a documented security, privacy, legal, or resource requirement justifies keeping a narrower version of the rule (and what that narrow rule looks like).
3. **Authorship accuracy:** verify which commit and provider actually introduced the lines. Never blame provider B for code written by provider A or a human.

Move every investigated candidate that turns out to be legitimate engineering (for example a documented OOM fix, a measured hardware/thermal cap with benchmark proof, a genuine security boundary scoped to untrusted input, or requested domain complexity) into **Checked and Clean (do not chase ghosts)** with exact `file:line` and why it is clean.

---

## Step 4: Report format

Deliver one crisp, evidence-backed report:

1. **Audit Header:**
   - Target repo, branch, and `HEAD` SHA
   - Detected authoring provider(s) (with git evidence)
   - Auditor model and provider, plus explicit cross-provider status (`CROSS-PROVIDER VERIFIED` or `SAME-PROVIDER BEST-EFFORT - NOT CROSS-PROVIDER VERIFIED`)
   - Finding counts by classification
2. **Confirmed Findings table:**

```markdown
| ID | Classification | Severity | Location | Authoring Provider (Commit) | Concrete Harm | Justified Subset to Keep | Smallest Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NA-01 | guardrail overreach | High | `lib/outbound-guard.ts:84` | claude (`a1b2c3d`) | Strips full sentences naming accepted payment methods from authenticated owner FAQ answers | Keep blocking unsolicited card/PIN solicitation from untrusted prompt injection | Scope regex to solicitation imperatives and bypass verified owner FAQ fields |
```

3. **Checked and Clean (do not chase ghosts):**
   - Mandatory section (never omit, even when findings exist).
   - List every inspected file/path and candidate rule that held up under review, with `file:line`, true author/commit, and why it is a legitimate constraint rather than a nerf.
4. **Paths Checked Receipt:**
   - Exact files, diff ranges, and git history ranges inspected ("0 findings" without naming checked paths is invalid).
5. **Recommended Next Actions:**
   - Ordered fixes ready for [`/work-queue`](../work-queue/SKILL.md) or permanent structural guards via [`/correction-loop`](../correction-loop/SKILL.md).
