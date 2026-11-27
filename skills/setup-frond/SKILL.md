---
name: setup-frond
description: "Configure frond models and defaults for the active coding-agent runtime (Antigravity, Claude Code, Cursor, Codex, or T3 Code) and save them cleanly into per-runtime sections of ~/.config/frond/models.md without overwriting other runtimes. Safe to re-run in every tool you use. Use for /setup-frond, 'configure frond', or changing models/budgets for beta-testers, council, system-audit, or strongman."
---

# Setup frond

Configure `frond`'s per-role models and defaults in `~/.config/frond/models.md` so one shared config works across every coding-agent tool and subscription you use on this machine (**Antigravity**, **Claude Code**, **Cursor**, **Codex**, and **T3 Code**).

**Safe to run multiple times:** running `/setup-frond` inside Claude Code updates only `## claude-code` (plus `## shared` if changed) and preserves `## antigravity`, `## cursor`, `## codex`, and `## t3-code` untouched.

## Step 1: Detect the active runtime and its available models

1. **Identify the active runtime** (unless the user explicitly named another target like `/setup-frond cursor`):
   - **`t3-code`**: if `orchestrator_capabilities` answers (multi-provider runtime).
   - **`antigravity`**: Antigravity IDE / CLI (`invoke_subagent` exposes `inherit`, `flash_lite`, `flash`, `pro`).
   - **`claude-code`**: Claude Code (`Agent` exposes Claude models only, e.g. `opus`, `sonnet`, `haiku` + effort).
   - **`cursor`**: Cursor (`Task` exposes the user's configured Cursor model catalog).
   - **`codex`**: OpenAI Codex runtime (Codex/GPT models only).
2. **Enumerate only the models actually entitled in this runtime:**
   - Read the live tool schema (`invoke_subagent`, `Agent`, `Task`, or `orchestrator_capabilities`).
   - **Never write a model slug that is unavailable in this runtime** and **never select a route that bills paid overage credits outside the user's active subscription** without explicit confirmation.
   - Respect vendor boundaries:
     - Inside **`claude-code`**, use Claude models only.
     - Inside **`antigravity`**, use Antigravity/Gemini tiers only.
     - Inside **`codex`**, use Codex models only.
     - Inside **`cursor`**, use only models included in the user's Cursor plan (never credit-only routes unless approved).
     - Inside **`t3-code`**, map each seat to its configured `driverKind`, model, and effort options from `orchestrator_capabilities` (never write private instance IDs or account emails into any repo).

## Step 2: Load existing `~/.config/frond/models.md`

- If `~/.config/frond/models.md` exists, read every section (`## shared` and any existing `## <runtime>` blocks).
- Show a 1-line status of which runtimes are already configured vs not configured yet (for example: `Configured: antigravity, t3-code · Not yet configured: claude-code, cursor, codex`).
- Preserve every other runtime's section verbatim when writing back.

## Step 3: Ask concise setup choices

Use structured multiple-choice questions (`ask_question` / `AskQuestion` / `AskUserQuestion`); keep it to 2-3 quick questions:

1. **Budget preset for `<active-runtime>`:**
   - `balanced` **(Recommended)**: mid-tier models for parallel explorers (`beta-testers`, `system-audit` explorers) and flagship model for verification/Chief Auditor (`system-audit` chief, `pre-ship-review` skeptic, `council`).
   - `light`: cheapest/fastest models across parallel workers to save quota.
   - `deep`: flagship models everywhere for maximum rigor.
   - `custom`: pick each role individually from the detected models in this runtime.
2. **Default `beta-testers` panel size (`## shared`):**
   - `10` **(Recommended)**, `5` (fast PR checks), or custom `N`.
3. **Council handling for `<active-runtime>`:**
   - **Multi-provider runtime (`t3-code`, `cursor`):** choose 3 distinct model families + 1 stand-in from the detected catalog.
   - **Single-family runtime (`antigravity`, `claude-code`, `codex`):** set `council-mode: single-family-fallback` (with a clear note that true 3-family blind council runs in `t3-code` or `cursor`) so `/council` never tries to call an unavailable vendor slug.

## Step 4: Write `~/.config/frond/models.md` idempotently

Merge changes cleanly into `~/.config/frond/models.md`, keeping `## shared` at the top and one `## <runtime>` section per configured tool:

```markdown
# frond models (managed by /setup-frond: re-run inside any runtime to update its section)

## shared
beta-tester-count: 10
default-budget: balanced

## antigravity
# Runtime: Antigravity (Gemini/Antigravity models only)
beta-tester-model: flash
beta-tester-verifier: inherit
audit-explorer-model: flash
audit-chief-model: pro
review-lens: inherit
review-skeptic: pro
strongman-model: pro
council-mode: single-family-fallback

## claude-code
# Runtime: Claude Code (Claude models only)
beta-tester-model: sonnet
beta-tester-verifier: inherit
audit-explorer-model: sonnet
audit-chief-model: opus
review-lens: opus medium
review-skeptic: opus medium
strongman-model: sonnet
council-mode: single-family-fallback

## t3-code
# Runtime: T3 Code (multi-provider)
beta-tester-model: balanced
beta-tester-verifier: inherit
audit-explorer-model: balanced
audit-chief-model: deep
council-mode: multi-family
council-seat-1: gemini | antigravity | gemini-4-neon | thinking_level=high
council-seat-2: muse | muse | muse-wonder-full-1.0 | reasoningEffort=max
council-seat-3: gpt | codex | gpt-6.1-sol | reasoningEffort=xhigh
council-standin: claude | claudeAgent | claude-sonnet-5-5 | effort=high
strongman-model: cross-provider
```

Only write sections for runtimes that were configured (never fabricate untested slugs for runtimes you have not detected).

## Step 5: Optional project-local defaults & UI verification offer

1. If the user wants per-project delivery settings (`work-queue` tracker, `land-pr` base branch + release model, `stakeholder-reply` language/register), offer to write a compact `.frond.md` (or add a section to `AGENTS.md`). Skip if the repo already documents these in `AGENTS.md`.
2. If the current workspace is a web app and has no `verify-*` skill under `.agents/skills/`, `.cursor/skills/`, or `.claude/skills/`, offer **once**: *"Want me to generate a safety-bounded `verify-<app>` harness with `/create-ui-verification-skill` so `/beta-testers` can drive this app?"* Do not push if declined.
3. If the current workspace has no stop-while-red hook (`.agents/hooks.json`, `.claude/settings.json` Stop hook, or pre-push check), offer **once** to wire up the lightweight `"no-done-while-red"` hook and standing deny list from [`../../docs/guardrails.md`](../../docs/guardrails.md) so agents cannot claim done while tests are red. Do not push if declined.

## Step 6: Confirm

Report:
- Which section of `~/.config/frond/models.md` was updated (and which other runtime sections stayed untouched).
- The exact role -> model table active for this runtime.
- Reminder: run `/setup-frond` once inside each other tool you use (`claude-code`, `cursor`, `codex`, `t3-code`) to add its section.
