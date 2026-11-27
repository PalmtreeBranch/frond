# Cross-tool harness guide

`frond` skills are written in tool-neutral markdown so one repository works across Antigravity, Cursor, Claude Code, and Codex. Read the column for your active runtime when a skill invokes subagents, browser tools, or questions.

## Primitive mapping

| Concept in `frond` | Antigravity | Cursor | Claude Code | Codex |
| --- | --- | --- | --- | --- |
| Spawn a subagent | `invoke_subagent` (or `browser` for live UI) | `Task` (`run_in_background: true`) | `Agent` (`subagent_type: "general-purpose"` or `"Explore"`) | Spawn subagent / parallel worker |
| Multi-provider review (`council`) | T3 Code `delegate_task` when present; otherwise `invoke_subagent` with distinct models | `Task` with explicit `model` slugs per family | T3 Code `delegate_task` or `Agent` with distinct model tiers | T3 Code `delegate_task` or parallel read-only subagents |
| Live UI testing (`beta-testers`) | Project `verify-*` CLI, Playwright script, or `browser` subagent | Project `verify-*` CLI, Playwright, or browser MCP | Project `verify-*` CLI or Playwright via `Bash` | Project `verify-*` CLI or Playwright via shell |
| Structured user choice | `ask_question` | `AskQuestion` | `AskUserQuestion` (plain text in `-p` mode) | Plain text concise choice list |
| Task checklist | `update_steps` | Todolist tool | `TodoWrite` | Plan / checklist in reply |
| Skill discovery path | `~/.gemini/config/plugins/frond` or `.agents/skills/` | `~/.cursor/plugins/frond` or `.cursor/skills/` | `~/.claude/plugins/frond` or `.claude/skills/` | `~/.codex/skills/` or `.agents/skills/` |

## Model configuration (`~/.config/frond/models.md`)

Run [`/setup-frond`](../skills/setup-frond/SKILL.md) inside each tool you use (`antigravity`, `claude-code`, `cursor`, `codex`, `t3-code`). It writes **per-runtime sections** into one `~/.config/frond/models.md` file so switching tools or subscriptions never breaks another runtime's config.

Each skill reads `## shared` first, then the section matching the **active runtime** (`## antigravity`, `## claude-code`, `## cursor`, `## codex`, or `## t3-code`).

Example `~/.config/frond/models.md`:

```markdown
# frond models (managed by /setup-frond)

## shared
beta-tester-count: 10
default-budget: balanced

## antigravity
beta-tester-model: flash
beta-tester-verifier: inherit
audit-explorer-model: flash
audit-chief-model: pro
strongman-model: pro
council-mode: single-family-fallback

## claude-code
beta-tester-model: sonnet
beta-tester-verifier: inherit
audit-explorer-model: sonnet
audit-chief-model: opus
strongman-model: sonnet
council-mode: single-family-fallback

## t3-code
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

### Model tier mapping (`beta-testers`)

When a skill specifies a logical tier (`light`, `balanced`, `deep`) instead of an explicit model slug, map it to the active runtime's available models:

| Logical tier | Intent | Antigravity (`invoke_subagent` `Model`) | Claude Code (`Agent` `model`) | Cursor (`Task` `model`) | Codex / other |
| --- | --- | --- | --- | --- | --- |
| **`light`** | Fast / cheapest for large sweeps | `flash_lite` | `haiku` | Fast/mini/haiku-class slug | Cheapest fast model |
| **`balanced` (default)** | Middle tier: strong UI driving at reasonable cost | `flash` | `sonnet` (or `haiku` if user prefers faster) | Mid-tier sonnet/flash/balanced slug | Default mid-tier model |
| **`deep`** | Extensive / flagship reasoning for subtle UX & edge bugs | `pro` (or `inherit` if already on flagship) | `opus` | Flagship opus/pro/xhigh slug | Highest reasoning model |
| **Explicit slug** | User names a model (e.g. `opus`, `haiku`, `gemini-4-neon`) | Pass matching `Model` or omit if unsupported and say so | Pass exact `model` (and `effort` if supported) | Pass exact slug from available models | Pass exact model ID |

Rules:
- Never hardcode private instance IDs, account emails, or API keys in a repository or skill brief.
- Never route a seat through a provider that bills outside the user's active subscription unless the user explicitly approves it.
- If a runtime rejects a model slug or only exposes one model family, fall back cleanly to the closest available model (or omit `model` to inherit) and state that in one line.
