---
name: setup-frond
description: "Configure frond models and defaults for any active coding-agent runtime (Antigravity, Claude Code, Cursor, Codex, T3 Code, OpenCode, GitHub Copilot, Windsurf, Gemini CLI, or custom) and save them into per-runtime sections of ~/.config/frond/models.md without overwriting other runtimes. Safe to re-run in every tool you use. Use for /setup-frond, 'configure frond', or changing models/budgets for beta-testers, council, system-audit, nerf-audit, or strongman."
---

# Setup frond

Configure `frond`'s per-role models and defaults in `~/.config/frond/models.md` so one shared config works across every coding-agent tool and subscription you use on this machine (**Antigravity**, **Claude Code**, **Cursor**, **Codex**, **T3 Code**, **OpenCode**, **GitHub Copilot**, **Windsurf**, **Gemini CLI**, or any other Agent Skills runtime).

**Safe to run multiple times:** running `/setup-frond` inside Claude Code updates only `## claude-code` (plus `## shared` if changed) and preserves every other `## <runtime>` section untouched.

## Step 1: Detect the active runtime and its available models

1. **Identify the active runtime** (unless the user explicitly named another target like `/setup-frond opencode`):
   - **`t3-code`**: if `orchestrator_capabilities` answers (multi-provider runtime).
   - **`antigravity`**: Antigravity IDE / CLI (`invoke_subagent` exposes `inherit`, `flash_lite`, `flash`, `pro`).
   - **`claude-code`**: Claude Code (`Agent` exposes Claude models only, e.g. `opus`, `sonnet`, `haiku` + effort).
   - **`cursor`**: Cursor (`Task` exposes the user's configured Cursor model catalog).
   - **`codex`**: OpenAI Codex runtime (Codex/GPT models only).
   - **`opencode`**: OpenCode (`opencode.json` / provider catalog, including Token Pass, OpenRouter, Vercel AI Gateway, Anthropic, OpenAI, Gemini, or local Ollama models).
   - **`copilot`**: GitHub Copilot CLI / VS Code (models enabled on the user's Copilot plan).
   - **`windsurf`**: Windsurf / Cascade (models enabled in the user's Windsurf plan).
   - **`gemini-cli`**: Gemini CLI (Gemini models only).
   - **Other runtime (e.g. `amp`, `cline`, `roo`, `pi`, or custom):** pick a short lowercase kebab-case section name (`## <runtime>`) and store only models confirmed available in that tool.
2. **Enumerate only the models actually entitled in this runtime:**
   - Read the live tool schema (`invoke_subagent`, `Agent`, `Task`, `orchestrator_capabilities`) or the tool's local config (for example `~/.config/opencode/opencode.json`).
   - **Never write a model slug that is unavailable in this runtime** and **never select a route that bills paid overage credits outside the user's active subscription** without explicit confirmation.
   - Respect provider boundaries:
     - Single-family runtimes (**`claude-code`**, **`antigravity`**, **`gemini-cli`**, **`codex`**): only write models from that vendor; set `council-mode: single-family-fallback` and `nerf-audit-mode: single-family-warn`.
     - Multi-provider runtimes (**`t3-code`**, **`cursor`**, **`opencode`**, **`copilot`**, **`windsurf`**): allow 3 distinct model families for `/council` and cross-provider auditor routes (`nerf-audit-mode: cross-provider` plus `nerf-audit-for-claude`, `nerf-audit-for-codex`, `nerf-audit-for-gemini`) only across providers actually included in the user's active plan/keys. Never write private instance IDs, account emails, or API keys into any repo.

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
3. **Council and cross-provider audit handling for `<active-runtime>`:**
   - **Multi-provider runtime (`t3-code`, `cursor`, `opencode`, `copilot`, `windsurf`):** choose 3 distinct model families + 1 stand-in for `/council`, and map cross-provider nerf auditors (`nerf-audit-for-claude`, `nerf-audit-for-codex`, `nerf-audit-for-gemini`) so every authoring provider is audited by a different family from the detected catalog.
   - **Single-family runtime (`antigravity`, `claude-code`, `codex`, `gemini-cli`):** set `council-mode: single-family-fallback` and `nerf-audit-mode: single-family-warn` (with a clear note that same-provider self-audits trigger a warning and true cross-provider audits run from another provider or multi-provider runtime like `t3-code`, `opencode`, or `cursor`) so skills never call an unavailable vendor slug.

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
nerf-audit-mode: single-family-warn
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
nerf-audit-mode: single-family-warn
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
nerf-audit-mode: cross-provider
nerf-audit-for-claude: gemini | antigravity | gemini-4-neon | thinking_level=high
nerf-audit-for-codex: claude | claudeAgent | claude-sonnet-5-5 | effort=high
nerf-audit-for-gemini: gpt | codex | gpt-6.1-sol | reasoningEffort=xhigh
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
- Reminder: run `/setup-frond` once inside each other tool you use (`claude-code`, `cursor`, `codex`, `t3-code`, `opencode`, `copilot`, `windsurf`, `gemini-cli`, or custom) to add its section.
