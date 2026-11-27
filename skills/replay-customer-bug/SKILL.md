---
name: replay-customer-bug
description: "Turn a real customer screenshot, support report, walkthrough, or call into a small anonymized test case, reproduce the failure through the normal product flow, verify the fix against the same case, and assert whether any booking, payment, or outbound message occurs. Use for /replay-customer-bug when debugging a reported user issue or field walkthrough."
---

# Replay customer bug

Start from real field evidence (a customer screenshot, support ticket, inbound message, call transcript, or fresh-install walkthrough) and turn it into a small, sanitized, repeatable test case that drives the **normal product flow** before and after the fix.

Pairs with [`../repro-first/SKILL.md`](../repro-first/SKILL.md) (general bug-fix cadence) and [`../stakeholder-reply/SKILL.md`](../stakeholder-reply/SKILL.md) (updating the customer once the fix is verified live).

## Hard rules

1. **Strip all personal data before writing any fixture or test.** Replace real names, phone numbers, email addresses, venue/account names, booking references, tokens, and free-text PII with synthetic placeholders. Never commit customer PII into git.
2. **Drive the normal product flow.** Reproduce through the real UI route, API handler, webhook parser, or tool dispatch; never a shortcut that skips validation, auth, settings resolution, or side-effect emitters.
3. **Always verify side-effect boundaries.** Explicitly check whether a booking, payment, email, SMS, webhook, or notification happened (or was correctly suppressed) during both the failing replay and the fixed replay.
4. **Never replay against live customer accounts or production side effects.** Use local dev, isolated/demo mode, or mocked provider boundaries.

---

## Workflow

### 1. Extract the minimal reproducing context
From the screenshot, report, walkthrough, or call, identify only the facts that drive the code path:
- **Actor & role:** guest, anonymous visitor, signed-in member, staff, admin, or fresh install with zero state.
- **Account / tenant settings:** flags, plan tier, locale, timezone, connected integrations, or missing/empty config.
- **Exact sequence of inputs:** URL/entry point, form values, messages, button clicks, retries, or timing order.
- **Observed harm:** what the user saw (or failed to see) and any unintended or missing side effect (duplicate booking, silent drop, wrong message, failed charge).

### 2. Build a small anonymized replay case
- Translate those facts into the smallest focused test, invariant script, or browser walkthrough fixture with all PII scrubbed.
- Include assertions for **both**:
  1. The user-visible output (screen state, reply text, HTTP status, UI error).
  2. Every critical side effect (**bookings, payments, outbound messages/emails/SMS, staff alerts**): assert exact call count and payload, including asserting `0` calls when nothing should fire.

### 3. Reproduce the failure before fixing
- Run the replay case against the current code (before editing application logic).
- Confirm it fails for the **exact reason** reported by the customer.
- If it passes on the first try, a real precondition is missing (role, setting, locale, timing, or data shape); inspect the report again until the failure reproduces faithfully.

### 4. Apply the minimal root-cause fix and re-run
- Fix the underlying cause (never a one-off special case for one customer or input string).
- Re-run the exact same replay case and confirm:
  - The user-visible outcome is fixed.
  - Bookings, payments, and outbound messages match the contract (zero duplicates, zero silent drops).
- Run fast affected checks and lint.

### 5. Report
Summarize cleanly:
- **Extracted context:** role, key settings, sanitized input sequence.
- **Replay case:** path to the new test/script and exact command.
- **Before vs after:** failing output before fix, passing output after fix, and verified booking/payment/message side effects.
- **Next step:** if a customer is waiting, offer [`/land-pr`](../land-pr/SKILL.md) and [`/stakeholder-reply`](../stakeholder-reply/SKILL.md) (and [`/correction-loop`](../correction-loop/SKILL.md) if this bug class happened before).
