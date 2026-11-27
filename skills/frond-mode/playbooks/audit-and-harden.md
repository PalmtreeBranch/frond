# Playbook: Audit & harden

Copy these steps into your checklist first. Keep discovery strictly read-only before fixing anything.

1. **Run full-system audit:** Run [`../../system-audit/SKILL.md`](../../system-audit/SKILL.md) (7 parallel explorers including cross-provider Slice 7 + flagship cross-provider Chief Auditor/Skeptic pass) to produce the Severity x Likelihood (`P0`–`P3`) ranked matrix.
2. **Cross-provider nerf audit on AI-authored surfaces:** When auditing AI-authored branches, prompt/guard layers, ML/inference pipelines, or multi-model routers, run [`../../nerf-audit/SKILL.md`](../../nerf-audit/SKILL.md) from a **different model provider** than the code author (warn and switch runtimes if on a matching single-family runtime).
3. **Align on priority:** Present the `P0` and `P1` items (sorted by Score, then Effort `S -> L`) and confirm which ones to file and fix now.
4. **Execute cleanly:** Hand the approved items to [`../../work-queue/SKILL.md`](../../work-queue/SKILL.md) (one issue = one branch = one PR, with [`../../council/SKILL.md`](../../council/SKILL.md) on auth/tenancy/billing fixes, and [`../../consolidate/SKILL.md`](../../consolidate/SKILL.md) when deduplicating parallel implementations or shallow layers in small closed-loop batches).
5. **Make fixes permanent:** For any systemic vulnerability or nerf class, add a lint, type, or behavioral invariant check via [`../../correction-loop/SKILL.md`](../../correction-loop/SKILL.md) with real red-without-fix proof (avoiding standalone `readFileSync` check sprawl).
6. **Land & verify:** Land each approved PR via [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) and update the audit record with fixed commit SHAs.
