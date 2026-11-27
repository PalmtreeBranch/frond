# Cross-tool harness guide

`frond` skills are written in tool-neutral markdown so one repository works across Antigravity, Cursor, Claude Code, Codex, T3 Code, OpenCode, GitHub Copilot, Windsurf, Gemini CLI, and any other Agent Skills runtime. Read the column for your active runtime when a skill invokes subagents, browser tools, or questions.

## Primitive mapping

| Concept in `frond` | Antigravity | Cursor | Claude Code | Codex | OpenCode / Copilot / Windsurf / Gemini CLI |
| --- | --- | --- | --- | --- | --- |
| Spawn a subagent | `invoke_subagent` (or `browser` for live UI) | `Task` (`run_in_background: true`) | `Agent` (`subagent_type: "general-purpose"` or `"Explore"`) | Spawn subagent / parallel worker | Native subagent / task tool (or sequential pass if single-agent) |
| Multi-provider review (`council`) | T3 Code `delegate_task` when present; otherwise single-family fallback | `Task` with explicit `model` slugs per family | T3 Code `delegate_task` or single-family fallback | T3 Code `delegate_task` or single-family fallback | Multi-family when provider catalog exposes 3 families (OpenCode, Copilot, Windsurf), else single-family fallback |
| Cross-provider nerf audit (`nerf-audit`, `system-audit` Slice 7) | Single-family warning if auditing Gemini-authored code; cross-provider satisfied for non-Gemini authors | `Task` routed to a different family than the detected code author | Single-family warning if auditing Claude-authored code; cross-provider satisfied for non-Claude authors | Single-family warning if auditing Codex/OpenAI-authored code; cross-provider satisfied for non-OpenAI authors | Automatic cross-provider routing via `~/.config/frond/models.md` on multi-provider runtimes (`t3-code`, `opencode`, `copilot`, `windsurf`); single-family warning on `gemini-cli` |
| Live UI testing (`beta-testers`) | Project `verify-*` CLI, Playwright script, or `browser` subagent | Project `verify-*` CLI, Playwright, or browser MCP | Project `verify-*` CLI or Playwright via `Bash` | Project `verify-*` CLI or Playwright via shell | Project `verify-*` CLI, Playwright, or browser MCP |
| Structured user choice | `ask_question` | `AskQuestion` | `AskUserQuestion` (plain text in `-p` mode) | Plain text concise choice list | Native question tool or plain text choice list |
| Task checklist | `update_steps` | Todolist tool | `TodoWrite` | Plan / checklist in reply | Native todo tool or checklist in reply |
| Skill discovery path | `~/.gemini/config/plugins/frond` or `.agents/skills/` | `~/.cursor/plugins/frond` or `.cursor/skills/` | `~/.claude/skills/` or `.claude/skills/` | `~/.codex/skills/` or `.agents/skills/` | `~/.config/opencode/skills/`, `~/.copilot/skills/`, `~/.codeium/windsurf/skills/`, `~/.gemini/skills/`, or `.agents/skills/` |

## Model configuration (`~/.config/frond/models.md`)

Run [`/setup-frond`](../skills/setup-frond/SKILL.md) inside each tool you use (`antigravity`, `claude-code`, `cursor`, `codex`, `t3-code`, `opencode`, `copilot`, `windsurf`, `gemini-cli`, or any custom runtime name). It writes **per-runtime sections** into one `~/.config/frond/models.md` file so switching tools or subscriptions never breaks another runtime's config.

Each skill reads `## shared` first, then the section matching the **active runtime** (`## <runtime>`).

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
nerf-audit-mode: single-family-warn
strongman-model: pro
council-mode: single-family-fallback

## claude-code
beta-tester-model: sonnet
beta-tester-verifier: inherit
audit-explorer-model: sonnet
audit-chief-model: opus
nerf-audit-mode: single-family-warn
strongman-model: sonnet
council-mode: single-family-fallback

## opencode
beta-tester-model: balanced
beta-tester-verifier: inherit
audit-explorer-model: balanced
audit-chief-model: deep
nerf-audit-mode: cross-provider
nerf-audit-for-claude: gemini-or-openai
nerf-audit-for-codex: claude-or-gemini
nerf-audit-for-gemini: openai-or-claude
council-mode: multi-family
strongman-model: cross-provider

## t3-code
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

### Cross-provider audit routing (`nerf-audit`, `system-audit`, `pre-ship-review`)

- **Multi-provider runtimes (`t3-code`, `cursor`, `opencode`, `copilot`, `windsurf`):** detect the target code's authoring provider from branch prefixes (`claude/*`, `codex/*`, `gemini/*`), commit trailers, PR metadata, or user input, then pick the matching `nerf-audit-for-<author>` route (or any entitled model from a different provider family). Never bill outside the user's active subscription without explicit approval.
- **Single-family runtimes (`antigravity`, `claude-code`, `codex`, `gemini-cli`):** if the active runtime's family differs from the code author's family, cross-provider auditing is satisfied. If they match, warn the user that same-provider self-auditing has blind spots, recommend switching to another provider or multi-provider runtime, and only run a clearly flagged best-effort pass if the user opts in.

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
