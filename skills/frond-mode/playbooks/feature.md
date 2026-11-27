# Playbook: Feature

Copy these steps into your checklist first. You own the design, verification, and final diff.

1. **Ground before writing (Grounding Receipt):** Read the project manifest (`package.json`, `pyproject.toml`, etc.) and record exact versions of every library this task touches. Verify every external API, SDK call, or CLI flag against docs, MCP docs, or installed dependency source — if a feature cannot be verified in docs or source, stop and tell the user rather than guessing from memory.
2. **Frame, sharpen & UI anti-slop gate:**
   - Restate the user goal and smallest change in 2 lines. If ambiguous, run [`../../sharpen/SKILL.md`](../../sharpen/SKILL.md).
   - If visible UI changes, run [`../../feature-fit/SKILL.md`](../../feature-fit/SKILL.md) before writing UI code. Pause if the verdict is `CUT`, `DEFAULT`, or a different placement than asked.
3. **Signed plan (<25 lines, before editing non-trivial changes):** State concisely:
   - **Data shape & defaults:** types/state first; prefer smart code defaults over new toggles.
   - **Files to touch** AND **files promised NOT to touch**.
   - **Exact verification checks** at the end and what "pass" looks like.
   - **Re-plan trigger** (for example: a verification step fails twice or a missing API appears).
   - **One hidden risk** the user might not see.
4. **Implement cleanly:** Stay strictly inside the approved file list. If the app has multiple locales, write native copy and check ICU/length safety via [`../../locale-craft/SKILL.md`](../../locale-craft/SKILL.md).
5. **Prove it works (Receipt Table):** Run fast affected checks + lint. For UI changes, verify on desktop and `390x844` mobile (`verify-<app>` or [`../../beta-testers/SKILL.md`](../../beta-testers/SKILL.md)). Output a Receipt Table (`Check | Result | Evidence`). A row with no evidence did not happen.
6. **Clean & review:** Run [`../../comment-cleanup/SKILL.md`](../../comment-cleanup/SKILL.md). For consequential changes (guest/user answers, bookings, billing, auth, state writes), run [`../../pre-ship-review/SKILL.md`](../../pre-ship-review/SKILL.md) or [`../../council/SKILL.md`](../../council/SKILL.md) on the committed branch (or [`../../system-audit/SKILL.md`](../../system-audit/SKILL.md) `--scope diff` for a fast security sweep).
7. **Open PR & deliver:** Open a ready PR (under 40 lines per `worker.md`) with the Receipt Table. Hand off to [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) if the user asked to merge or ship.
