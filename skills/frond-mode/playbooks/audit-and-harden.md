# Playbook: Audit & harden

Copy these steps into your checklist first. Keep discovery strictly read-only before fixing anything.

1. **Run full-system audit:** Run [`../../system-audit/SKILL.md`](../../system-audit/SKILL.md) (parallel explorers on mid-tier model + flagship Chief Auditor/Skeptic pass) to produce the Severity x Likelihood (`P0`–`P3`) ranked matrix.
2. **Align on priority:** Present the `P0` and `P1` items (sorted by Score, then Effort `S -> L`) and confirm which ones to file and fix now.
3. **Execute cleanly:** Hand the approved items to [`../../work-queue/SKILL.md`](../../work-queue/SKILL.md) (one issue = one branch = one PR, with [`../../council/SKILL.md`](../../council/SKILL.md) on auth/tenancy/billing fixes).
4. **Make fixes permanent:** For any systemic vulnerability class, add a lint, type, or invariant check via [`../../correction-loop/SKILL.md`](../../correction-loop/SKILL.md) with red-without-fix proof.
5. **Land & verify:** Land each approved PR via [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) and update the audit record with fixed commit SHAs.
