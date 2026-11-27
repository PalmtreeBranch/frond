---
name: feature-fit
description: "Anti-slop product and UI gate before adding or pushing any visible feature to a dashboard, portal, or user flow. Stops feature spam by testing necessity, smart defaults, natural flow placement, and subtraction opportunities. Use for /feature-fit, before adding a UI control/card/tab/setting, or to audit a UI PR diff for bolted-on clutter."
---

# Feature fit (UI anti-slop gate)

Pause before adding anything visible to a user interface. AI coding makes it effortless to dump one more card onto the dashboard, one more tab into the sidebar, and one more toggle into settings until the product turns into clutter.

This skill evaluates **whether** a change earns UI space, **where** it belongs in the real user flow, and **what** should be simplified or removed first.

## Two modes

1. **Pre-build gate** (`/feature-fit <proposed feature>`): run before writing UI code. Produce a placement verdict and get alignment before editing.
2. **Pre-push diff audit** (`/feature-fit` with no args, or on a branch/PR): inspect `git diff <base>...HEAD` for every added component, route, nav item, card, badge, banner, modal, or settings toggle, and judge each one.

---

## Step 1: Map the real user surface first

Do not evaluate in the abstract. Inspect the live codebase first:
1. Read `PRODUCT.md` and `DESIGN.md` (if present).
2. Read the app's navigation structure (sidebar, header, tabs, route tree) and the exact pages adjacent to this feature.
3. Find every existing screen or control that already touches the same domain object or user job.
4. Count the current visual budget on the target screen (top-level nav items, cards/sections on the overview page, settings toggles in the target section).

---

## Step 2: Run the five gates

Score the proposal or diff against [`references/placement-rubric.md`](./references/placement-rubric.md):

1. **Necessity & Smart-Default Gate**
   - What concrete user job does this solve, and how often does a real user do it?
   - **Smart-default test**: If this behavior is right for almost every user, ship it as a **code default** with zero UI toggle. Settings exist only for genuine user choices, never to avoid making a product decision.
   - If the feature only helps developers or internal debugging, keep it out of customer UI (put it in admin/CLI/logs).

2. **Natural Flow & Placement Gate**
   - Where is the user mentally when they need this? Place the control at the **moment of need**, not on a generic overview page or settings dumping ground.
   - Compare three concrete options from least invasive to most invasive:
     - **Option A — Inline / progressive disclosure**: inside an existing row, drawer, empty state, or contextual action.
     - **Option B — Fold into an existing page/section**: merge with an existing view or replace an outdated block.
     - **Option C — New card, tab, or nav item**: highest bar. Must prove why Options A and B fail for a frequent user job.

3. **AI-Slop Pattern Check**
   Explicitly inspect for and reject these common vibe-coding traps:
   - **Dashboard card spam**: adding another KPI box, status pill, or summary card to the home/overview screen.
   - **Settings landfill**: adding a boolean switch for every edge case or rollout flag.
   - **Orphaned surface**: a new page or widget with no clear entry point before it and no clear next step after it.
   - **Duplicate source of truth**: two screens that edit or show the same concept slightly differently.
   - **Template clutter**: unearned eyebrows, badges on every card, decorative numbering, subtitles that restate the title, or stacked banners/toasts.

4. **Subtraction Gate**
   - What existing element, copy, toggle, or wrapper can be **deleted, merged, or simplified** in the same change so total cognitive load stays flat or goes down?
   - Default rule: if you add a top-level item, ask what comes out or merges.

5. **State & Surface Completeness Gate** (only if the feature survives Gates 1-4)
   - Verify the design accounts for: empty state (with a real next action), loading state, error recovery, mobile `390x844` layout, light + dark theme parity, and first-time user copy without jargon.
   - If the app supports multiple locales, check proposed nav/tab/button labels against the **longest** target locale per [`../locale-craft/SKILL.md`](../locale-craft/SKILL.md) before approving tight layouts.

---

## Step 3: Deliver one concrete verdict

Pick exactly one verdict:

| Verdict | Meaning | Next step |
| --- | --- | --- |
| **`CUT`** | Does not earn UI complexity or duplicates an existing flow. | Recommend dropping it; explain the simpler alternative. |
| **`DEFAULT`** | Good behavior, wrong as a UI control. | Ship as an automatic code default with zero new UI. |
| **`INTEGRATE`** | Belongs in the product, but inline inside an existing flow. | Name the exact route, component, and trigger point; show the before/after flow. |
| **`REPLACE`** | Earns space only by removing or merging an older element. | Name what gets deleted in the same PR. |
| **`NEW SURFACE`** | Justifies a new section, tab, or page. | Name exact nav location, hierarchy, mobile behavior, and state checklist. |

## Output rules

- Use the concise output template in [`references/placement-rubric.md`](./references/placement-rubric.md).
- Be candid, not agreeable. "This does not earn a dashboard card" is a valid and valuable answer.
- Cite real file paths and existing routes from Step 1 — never give generic UX advice.
- In pre-build mode, stop after the verdict if you recommend `CUT`, `DEFAULT`, or a different placement than the user asked for, so the user can approve before you write code.
- In pre-push diff mode, list every newly added UI element in a table with its verdict (`KEEP`, `MOVE INLINE`, `TURN INTO DEFAULT`, or `REMOVE`) so nothing sneaks into the portal unreviewed.
