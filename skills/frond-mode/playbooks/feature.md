# Playbook: Feature

Copy these steps into your checklist first. You own the design, verification, and final diff.

1. **Frame & sharpen:** Restate the user goal and smallest change in 2 lines. If the request is ambiguous or broad, run [`../../sharpen/SKILL.md`](../../sharpen/SKILL.md) first.
2. **UI anti-slop gate (if visible UI changes):** Run [`../../feature-fit/SKILL.md`](../../feature-fit/SKILL.md) before writing UI code. Pause if the verdict is `CUT`, `DEFAULT`, or a different placement than asked.
3. **Design the data shape first:** Name the types, state transitions, and storage/API boundaries before writing logic. Prefer smart read-time defaults over new settings toggles.
4. **Implement cleanly:** Make the smallest coherent change. If the app has multiple locales, write native copy and check ICU/length safety via [`../../locale-craft/SKILL.md`](../../locale-craft/SKILL.md).
5. **Prove it works:** Run fast affected checks + lint. For UI changes, verify on the real app (`verify-<app>` or [`../../beta-testers/SKILL.md`](../../beta-testers/SKILL.md) on the changed flow).
6. **Clean & review:** Run [`../../comment-cleanup/SKILL.md`](../../comment-cleanup/SKILL.md). For consequential changes (guest/user answers, bookings, billing, auth, state writes), run [`../../pre-ship-review/SKILL.md`](../../pre-ship-review/SKILL.md) or [`../../council/SKILL.md`](../../council/SKILL.md) on the committed branch.
7. **Open PR & deliver:** Open a ready PR (under 40 lines per `worker.md`). Hand off to [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) if the user asked to merge or ship.
