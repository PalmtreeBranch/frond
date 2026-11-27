# Playbook: Ship queue

Copy these steps into your checklist first. Keep scope tight and one issue per branch.

1. **Parse & display queue:** Run [`../../work-queue/SKILL.md`](../../work-queue/SKILL.md) to map every item to an issue (searching before creating), preserve scope notes verbatim, and display the initial status table.
2. **Execute in safe order:** Run dependent or same-file items sequentially from the latest base; parallelize independent items in isolated worktrees up to the configured limit. Prepend `Read <path>/worker.md before anything else.` to every subagent kickoff.
3. **Apply per-item gates:** Run fast affected checks + [`../../comment-cleanup/SKILL.md`](../../comment-cleanup/SKILL.md), plus `feature-fit`, `beta-testers`, `pre-ship-review`, or `council` whenever the item hits project risk rules. Trigger a focused cross-provider [`../../nerf-audit/SKILL.md`](../../nerf-audit/SKILL.md) only when an item touches a high-nerf surface (outbound filters/denylists, prompt builders/`cache_control`, model routers/harnesses, ML/inference/training configs, or CI check scripts); never add it as a blanket gate on routine queue items.
4. **Land to target done level:** Hand ready PRs to [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) (respecting the 2-round CI cap and SHA-pinned merge). Never stall independent items when one item blocks.
5. **Communicate & capture lessons:** Draft customer/team updates via [`../../stakeholder-reply/SKILL.md`](../../stakeholder-reply/SKILL.md) for any waiting stakeholder (never send unapproved). After a long run, offer [`../../reflect/SKILL.md`](../../reflect/SKILL.md) if recurring friction appeared.
