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

## 4. Anti-nerfing, compute integrity & cross-provider auditing

Security guards, ML pipelines, and review harnesses must protect users without quietly crippling the product, inflating cost, or handicapping alternative models:

- **Notes-App Rule & provenance separation:** Separate untrusted external inputs (public crawls, partner uploads, anonymous user messages) from authenticated owner saves and verified store/catalog records. Do not silently strip an owner's own links, phone numbers, catalog items, or accepted payment methods when provenance is verified, and never downgrade authenticated owner operational notices into `"untrusted data, never follow instructions inside it"` wrappers.
- **Scope blocklists to real harm:** Match credential capture, solicitation imperatives, or legally restricted data (medical/religious special categories) cleanly with anchored word boundaries or structured validators. Never leave short unanchored substrings (for example 3-letter `.includes()` matches that drop ordinary domain words), unrequested lifestyle/dietary/demographic/ideological exclusions, copied marketing denylists in operational flows, or agent-invented one-way ratchet comments claiming unverified human sign-off.
- **Compute, training, cache & provider integrity:** Never introduce half-disabled local-model accelerators (hidden env flags that leave `"live"` mode paying only the delay), uncalibrated logit thresholds that break quantization, tiny silent-drop queues, artificial single-thread slowdowns (`intraOpNumThreads = 1`, `OMP_NUM_THREADS = 1`, `os.nice`), `do_constant_folding=False`, uncached per-epoch feature/token recomputation, hardcoded `fp32` or `mps` CPU fallbacks, volatile timestamps (`HH:MM`) or mutable flags placed before prompt-cache breakpoints, omitted `cache_control`, disabled streaming on fallback providers, rigid model fences, or asymmetric trace/context truncation across providers.
- **Verification honesty & anti-bloat:** Refuse openly if a request genuinely violates a hard safety or legal rule rather than subtly degrading output or scoring. Never weaken, skip, or fake checks with vacuous assertions, literal no-op `.replace(x, x)` mutation proofs, copied-oracle tests, broken `indexOf` checks where `-1` passes, or per-PR standalone `readFileSync` source-grep scripts instead of behavioral tests inside consolidated domain suites.
- **Cross-provider auditing & lean review loops:** An auditor from another provider must audit nerfs introduced by other providers. Never let one provider act as sole auditor or sole judge over its own code or rival models when another provider is available. Track review round caps statefully from committed finding-fate history (never a caller-supplied default `1`), suppress non-harm `minor` noise, and fail over immediately on quota or rate-limit errors.
