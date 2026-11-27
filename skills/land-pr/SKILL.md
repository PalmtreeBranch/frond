---
name: land-pr
description: "Take an open pull request from ready to merged, and optionally to verified live in production (continuous deploy, scheduled release train, or manual release workflow). Reports the exact verified state with no guessing, classifies CI failures with a 2-round limit, pins merges to the checked head SHA, cleans up branches/worktrees, and hands off to stakeholder-reply. Use for /land-pr, 'merge when green', 'ship it', 'land this', 'release now', 'is it live?', or 'deploy it'."
---

# Land PR

Take an open pull request from "ready" to "merged" — and, when requested, to "verified live in production". Report the exact verified state with zero guessing. This skill finishes delivery; it does not design features or review code.

Read [`../../docs/harness.md`](../../docs/harness.md) when mapping platform wait/notification tools.

## Inputs

1. **Pull request:** defaults to the open PR for the current branch (or a PR number/branch named by the user).
2. **Landing level** (defaults to the project config when not specified):
   - **Level 1 — Merge only:** merge when green and clean up.
   - **Level 2 — Merge and wait for next normal release:** merge when green, then report when the normal deploy or release train will ship it (wait for deploy if continuous deploy).
   - **Level 3 — Merge and release now:** requires explicit words from the user such as `"release now"` or `"deploy it"`. Triggers a manual release workflow when the project uses a scheduled train or manual release.

## Project configuration

Read these from the repo's `AGENTS.md`, `.github/workflows/`, or `~/.config/frond/project.md` (infer sensible defaults from git/GitHub when not documented):
- **Base branch:** e.g. `main` or `supabase`.
- **Required checks:** named CI checks, or all checks required by branch protection.
- **Merge command:** e.g. `gh pr merge --squash --match-head-commit <SHA>` or a repo script that pins the merge to the checked commit.
- **Ownership policy:** default is only PRs created by this user or session.
- **Release model:** one of:
  - Continuous deploy on merge
  - Scheduled release train (times and time zone)
  - Manual release workflow (workflow name)
- **Live proof method:** deploy provider API (Vercel, Railway, Fly, Render, etc.), a health endpoint returning the commit SHA, or both.
- **Optional smoke checks:** URLs that must return `200`, or a short post-deploy check command.
- **CI round limit:** default `2` pushes (the initial push plus at most one fix push).
- **Cleanup policy:** delete remote + local branch after merge, and remove the worktree only if this session created it and it is clean.

---

## Workflow

### 1. Identify and verify ownership
- Resolve the PR, head branch, base branch, and current full `head` SHA.
- Confirm this user or session owns the PR.
- **Refuse** if the PR is a draft, has merge conflicts (unless resolved in step 3), or is owned by someone else — unless the user explicitly overrides this.

### 2. Read check state on the head SHA
- Always inspect checks on the exact current `head` SHA. Any new push resets evaluation.
- **Do not run the full test suite locally "to be safe".** CI is the merge gate.

### 3. Wait or classify CI failures
- **Pending checks:** wait using the platform's notification/event mechanism (never poll in a tight loop). If no event mechanism exists, check at intervals matching the repo's normal CI duration.
- **Failing check — classify first:**
  1. **Caused by this change:** fix it, commit, and push. Counts as **1 CI round**.
  2. **Known flaky:** re-run the failed job once. Does **not** count as a round.
  3. **Also fails on the base branch:** not caused by this PR. Report it and offer to file an issue (`Found while landing #<num>`). Do **not** fix it on this branch.
  4. **Conflict with the base branch:** merge the base branch in and push. Does **not** count as a round.
- **Round limit:** if round 2 also fails, **stop**. Report the failing check name, error text, and what was tried, then ask the user.

### 4. Pre-merge gate
Verify every item on the current `head` SHA before merging:
- All required checks are green on this exact `head` SHA.
- Zero merge conflicts.
- No unresolved review requesting changes (when configured).
- PR is not a draft.

### 5. Merge (pinned to head SHA)
- Run the configured merge command pinned to the exact checked `head` SHA (so a late push can never merge unchecked code).
- **Never** use admin bypass (`--admin`), never disable branch protection, never edit CI config to force a pass, and never force-push.

### 6. Release (by release model)
- **Continuous deploy:** wait for the deploy triggered by the merge commit.
- **Scheduled train:** trigger nothing unless the user explicitly requested Level 3 (`"release now"`). Report the next train time.
- **Manual workflow:** trigger it only at Level 3.

### 7. Verify live in production (Levels 2 continuous / Level 3)
Confirm all of the following before claiming a change is live:
1. The production deployment is in a `ready` / `success` state.
2. The deployed commit **contains** the merge commit — use a git ancestor check (`git merge-base --is-ancestor <merge-sha> <deployed-sha>`), because newer merges may already sit on top of it.
3. Optional post-deploy smoke checks pass.

If verification fails, report `"Merged. Deploy failed: <reason>."` or `"Blocked: merged, deploy not verified (<deploy id>)."` — never guess.

### 8. Clean up
- Delete the remote branch and the local branch.
- Remove the worktree **only** if this session created it and `git status` shows zero uncommitted changes, then run `git worktree prune`.
- Never touch another session's worktree or branch.

### 9. Report exact state
End with **exactly one** of these four states, plus the PR link and merge commit SHA:
- `Merged, not live yet. Live after the next release at HH:MM.`
- `Live in production since HH:MM (deploy <id>, commit <short SHA>).`
- `Merged. Deploy failed: <reason>.`
- `Blocked: <reason>. Next step: <what the user must do>.`

### 10. Hand off
If a customer, partner, or colleague is waiting on this change, offer to run [`/stakeholder-reply`](../stakeholder-reply/SKILL.md) and pass it what changed plus the verified live state.

## Hard rules
- Never say `"live"`, `"deployed"`, or `"fixed in production"` before step 7 proves it.
- Never merge another person's PR, bypass branch protection, or alter CI rules to get a pass.
- One pull request per run unless the user explicitly lists several.
