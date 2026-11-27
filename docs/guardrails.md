# Cross-tool guardrails & "no-done-while-red" hooks

Prompts can be forgotten halfway through a long agent run. Mechanical fences and hooks run every time. These templates work across Antigravity, Claude Code, Cursor, and plain git repos.

## 1. Standing deny rules (recommended baseline)

Configure your runtime's deny rules (evaluated before Ask/Allow) so agents cannot silently run destructive or leaky commands:

```text
command(sudo)
command(rm -rf)
command(git push)
write_file(.git/)
write_file(.env)
```

Keep paid credit overages off by default until you measure normal task burn.

## 2. "No done while red" stop hook

Blocks an agent from declaring a task finished while the project's fast checks or tests are failing.

### Shared check script (`scripts/receipt-check.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

# Replace with your repo's fast affected check or test command
if npm test --silent > /dev/null 2>&1; then
  echo '{"decision":"stop"}'
else
  echo '{"decision":"continue","reason":"Checks are red. Fix the root cause. Do not delete, skip, or loosen assertions."}'
fi
```

### Antigravity (`.agents/hooks.json`)

```json
{
  "lint-after-edits": {
    "PostToolUse": [
      {
        "matcher": "write_to_file|replace_file_content|multi_replace_file_content",
        "hooks": [{ "command": "npm run lint --silent", "timeout": 60 }]
      }
    ]
  },
  "no-done-while-red": {
    "Stop": [
      {
        "command": "./scripts/receipt-check.sh",
        "timeout": 300
      }
    ]
  }
}
```

### Claude Code (`.claude/settings.json`)

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/receipt-check.sh",
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

### Cursor / Codex / Tool-agnostic fallback (`.git/hooks/pre-push`)

```bash
#!/usr/bin/env bash
set -euo pipefail
npm test --silent
```

## 3. Receipt table standard ("no receipt, no merge")

Every finished task or verification pass must end with an evidence table. A row without concrete proof (command output, commit SHA, screenshot path, or checked-paths list) did not happen:

```markdown
| Check | Result | Evidence |
| --- | --- | --- |
| Type-check & lint | Pass | `npx tsc --noEmit && npm run lint` (0 errors) |
| Regression check | Pass | `npm test -- hours.test.ts` (failed before fix, 4/4 pass after) |
| Live UI (`1440x900` + `390x844`) | Pass | `0 console errors, overflow: false` (`evidence/hours-mobile.png`) |
| Diff security sweep | Pass | Checked `app/api/hours/route.ts`, `libs/hours.ts` (0 findings) |
```

## 4. Anti-nerfing & user-intent integrity ("the notes-app rule")

Security and compliance guards must stop attacks without quietly stripping what paying owners and users deliberately put into their own workspace:

- **Distinguish provenance, not just syntax:** Separate untrusted/scraped inputs (public crawls, partner uploads, anonymous user messages) from authenticated owner saves and verified store/provider results. Do not silently drop a customer's own links, phone numbers, catalog items, or operational facts when provenance is verified.
- **Scope blocklists to real harm:** Match credential capture, solicitation imperatives, or legally restricted data (medical/religious special categories) cleanly with word boundaries or structured validators. Never leave short unanchored substrings (for example matching `"nut"` inside `"minuter"`) or unrequested lifestyle/ideological exclusions in filters or ML/scoring weights.
- **No silent degradation or fake proofs:** If a request genuinely violates a hard safety or legal rule, refuse openly rather than subtly nerfing scoring, routing, or output quality. Never weaken, skip, or fake a verification check with no-op `.replace(x, x)` proofs or copied-oracle tests.
