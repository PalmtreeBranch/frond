# Playbook: Bug fix

Copy these steps into your checklist first. Every shipped line must trace to runtime evidence.

1. **Reproduce first:**
   - Starting from a customer screenshot, support report, walkthrough, or call -> run [`../../replay-customer-bug/SKILL.md`](../../replay-customer-bug/SKILL.md) (scrub PII, reproduce through the normal product flow, check booking/payment/message side effects).
   - Otherwise -> run [`../../repro-first/SKILL.md`](../../repro-first/SKILL.md) (real-surface repro + smallest failing check before editing code).
2. **Check blast radius (if touching shared helpers, DB, auth, or webhooks):** Run [`../../blast-radius/SKILL.md`](../../blast-radius/SKILL.md) and prove the safety fact with code.
3. **Fix root cause:** Apply the minimal fix at the first place the system went wrong. Revert any speculative edits.
4. **Verify red-to-green:** Re-run the exact reproduction/check from Step 1 and confirm it now passes, plus fast affected checks and lint.
5. **Prevent repeats:** If this bug class has occurred before (or is high-impact), pin it structurally with [`../../correction-loop/SKILL.md`](../../correction-loop/SKILL.md).
6. **Clean, review & ship:** Run [`../../comment-cleanup/SKILL.md`](../../comment-cleanup/SKILL.md), run [`../../pre-ship-review/SKILL.md`](../../pre-ship-review/SKILL.md) if consequential, and run a focused cross-provider [`../../nerf-audit/SKILL.md`](../../nerf-audit/SKILL.md) if the fix touches outbound filters/denylists, prompt builders/`cache_control`, model routers/harnesses, ML/local-LM inference/training configs, or CI check scripts (skip standalone `/nerf-audit` on routine bug fixes). Open the PR and hand off to [`../../land-pr/SKILL.md`](../../land-pr/SKILL.md) + [`../../stakeholder-reply/SKILL.md`](../../stakeholder-reply/SKILL.md) if a customer is waiting.
