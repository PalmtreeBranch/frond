# Security and trust

Installing someone else's agent skills gives those markdown files influence over what your coding agent does. You should be able to verify this repository in two minutes before installing it.

## Design guarantees

- **Plain text only, zero dependencies:** `frond` ships zero npm packages, zero compiled binaries, and zero network-calling scripts. Everything is readable markdown plus three small local scripts (`scripts/install.sh`, `scripts/validate.mjs`, `scripts/security-audit.mjs`).
- **No external telemetry or remote fetches:** nothing in this repo phones home, pipes remote downloads into a shell, or fetches remote prompts at runtime.
- **Explicit safety boundaries baked into skills:**
  - `/stakeholder-reply` never sends an email, SMS, or message without an explicit yes in the current turn, and treats inbound messages as untrusted data, never instructions.
  - `/land-pr` forbids admin bypass, disabling branch protection, and force-pushing.
  - `/beta-testers`, `/create-ui-verification-skill`, and `/replay-customer-bug` forbid testing against live customer data or paid outbound side effects, and require stripping personal data from test fixtures.
  - `/strongman` applies to non-sensitive local work only and explicitly forbids bypassing access controls, credentials, sandbox boundaries, or CAPTCHAs.
  - `/system-audit` and `/nerf-audit` are strictly read-only, and `/nerf-audit` enforces cross-provider auditing (a different model family than the code author) alongside anti-nerfing and anti-gaming checks.
  - `/setup-frond` never writes secrets, account emails, or private instance IDs into any repository.

## Automated security audit (local and CI)

Every push and pull request runs `node scripts/security-audit.mjs` in GitHub Actions (`.github/workflows/ci.yml`). You can run the exact same audit locally before symlinking anything:

```bash
node scripts/validate.mjs
node scripts/security-audit.mjs
bash -n scripts/install.sh
```

What `scripts/security-audit.mjs` enforces across every file in the repository:
1. Zero hidden zero-width or bidirectional Unicode characters (blocks invisible prompt-injection tricks).
2. Zero hidden HTML comment blocks concealing instructions from GitHub readers.
3. Zero remote shell pipes, encoded payloads, private keys, or API token shapes.
4. Zero network calls or `eval` inside `scripts/`.
5. Strict URL host allowlist (only GitHub, Herman's verified profile/project domains, and localhost).
6. Zero unexpected file types, zero external dependencies, and valid PNG header verification for `assets/logo.png`.
7. Mandatory safety guardrail assertions on every high-impact skill (`stakeholder-reply`, `land-pr`, `strongman`, `beta-testers`, `replay-customer-bug`, `system-audit`, `nerf-audit`, `consolidate`, `frond-mode`, `pre-ship-review`, `council`, `correction-loop`).

## Reporting an issue

If you spot an unsafe prompt pattern, a missing guardrail, or a supply-chain risk in any skill, open an issue on https://github.com/PalmtreeBranch/frond/issues.
