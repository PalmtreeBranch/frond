---
name: blast-radius
description: "Find what a small-looking change could break elsewhere before shipping (tracing past grep into DB columns, API JSON, webhooks, queues, feature flags, and third-party libraries) and prove the single safety fact by running real code instead of writing a reassuring essay. Use for /blast-radius, 'what could this break?', or checking a risky small diff."
disable-model-invocation: true
---

# Blast radius

Find what a change could break outside the diff before it ships. Listing direct callers is easy; grep does that in one second. The real job is finding the breakage grep misses and proving safety by running code.

## Never trust a writeup alone

A plausible-sounding safety essay is worthless without execution. Push every critical safety assumption as far down this evidence ladder as is cheap, and state exactly where you stopped:

1. **Assertion only**: worthless on its own.
2. **Code pointer**: exact `file:line` in app or library source.
3. **Trace**: walked the failure path step by step and showed it cannot reach.
4. **Executed check**: a small script or test that calls the real shipped code/library and fails loud if wrong.
5. **Live repro**: verified in the running app.

Aim for **level 4** whenever practical.

## Steps

1. **Read the full change.** Inspect the diff, every added/changed/deleted symbol, and implicit behavior changes (default values, timing, nullability, ordering).
2. **Name the one safety fact.** Most risky-looking changes are safe because of one core assumption (for example: *"this migration backfills before adding NOT NULL"* or *"no webhook consumer reads the old JSON key"*). Focus here first instead of padding a list of theoretical maybes.
3. **Trace where grep stops:**
   - Database columns, RLS policies, SQL functions, migrations, and background workers reading the same rows
   - API request/response JSON, webhook payloads, URL query params, and client caches
   - Environment variables, feature flags, and tenant/account config extremes (on, off, absent)
   - Third-party dependency internals (read the installed version in `node_modules` / lockfile, not assumptions from memory)
   - Lifecycle timing (React render/effect order, async queues, retries, unmount/cleanup)
4. **Rank confirmed risks honestly.** Separate confirmed risks (with `file:line`, likelihood, and user impact) from items checked and cleared. Never invent a caller or API; a search returning zero hits is still valid evidence.
5. **Prove the core safety fact with code.** Run a focused script or test against the real code path and paste the exact output. If you cannot run it, mark the fact **`unproven`** explicitly.

## Output format

- **What changes:** plain 2-3 sentence summary including subtle side effects.
- **Core safety fact:** the assumption, the evidence level reached (1-5), and exact command output (or `unproven`).
- **Confirmed risks:** each with `file:line`, failure mode, impact, and how to test.
- **Checked & cleared:** short list of adjacent surfaces verified safe.
- **Before merging:** the cheapest check or script to keep so this cannot regress.
