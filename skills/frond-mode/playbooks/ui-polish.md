# Playbook: UI polish & release QA

Copy these steps into your checklist first. Drive the real rendered UI — never grade UI from JSX alone.

1. **Audit placement & clutter:** Run [`../../feature-fit/SKILL.md`](../../feature-fit/SKILL.md) on the target surface or current branch diff to catch bolted-on cards, redundant toggles, or awkward flow placement.
2. **Check localization & copy (if multi-language):** Run [`../../locale-craft/SKILL.md`](../../locale-craft/SKILL.md) for native phrasing, glossary consistency, ICU/tag safety, and longest-locale button lengths.
3. **Ensure safe live harness:** Check for a project `verify-<app>` skill. If missing and the repo needs repeatable browser QA, offer [`../../create-ui-verification-skill/SKILL.md`](../../create-ui-verification-skill/SKILL.md).
4. **Run live persona QA:** Run [`../../beta-testers/SKILL.md`](../../beta-testers/SKILL.md) (default 10 personas on `balanced`, or user's configured count/model) across desktop, `390x844` mobile, light + dark themes, and non-default locales.
5. **Fix verified bugs & re-check:** Fix confirmed P0/P1/P2 bugs from the report, re-verify on the live UI, run [`../../comment-cleanup/SKILL.md`](../../comment-cleanup/SKILL.md), and open the PR with screenshots/evidence linked.
