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

## Model configuration (optional)

Skills that pick models across families (`council`, `pre-ship-review`) check for an optional user config file at `~/.config/frond/models.md`.

Example `~/.config/frond/models.md`:

```markdown
# frond models
council-seat-1: gemini | antigravity | gemini-4-neon | thinking_level=high
council-seat-2: claude | claudeAgent | claude-opus-5-5 | effort=high
council-seat-3: gpt | codex | gpt-6.1-sol | reasoningEffort=xhigh
council-standin: claude | claudeAgent | claude-sonnet-5-5 | effort=high
review-lens: inherit
review-skeptic: inherit
tester: fast-or-inherit
```

Rules:
- Never hardcode private instance IDs, account emails, or API keys in a repository or skill brief.
- Never route a seat through a provider that bills outside the user's active subscription unless the user explicitly approves it.
- If a runtime only exposes one model family, state that explicitly up front instead of pretending three families reviewed the change.
