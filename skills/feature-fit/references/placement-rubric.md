# Placement rubric & output template for `/feature-fit`

## Quick scoring checklist

| Gate | Pass | Fail (red flag) |
| --- | --- | --- |
| **User frequency** | Used daily/weekly, or critical during setup/recovery | Rare edge case elevated to primary nav or dashboard |
| **Smart default** | Genuine user preference that varies by customer | Behavior that is clearly better on for everyone |
| **Moment of need** | Appears right where the user sees the problem or data | Buried in unrelated settings or bolted onto the overview page |
| **Single source of truth** | One clear place to view and edit this concept | Second place that mirrors or conflicts with an existing page |
| **Visual weight** | Matches the importance of the job (link < inline action < drawer < section < top-level nav) | Hero banner or top-level card for a secondary utility |
| **Subtraction** | Net UI surface stays flat or shrinks | Pure addition with zero cleanup |
| **Mobile & states** | Clean at `390x844`; empty, loading, and error states defined | Desktop-only card; assumes happy-path populated data |

## Escalation ladder (cheapest surface first)

Always start at rung 1 and move down only when the rung above provably fails:

1. **No UI (smart default in code)** — best possible outcome.
2. **Improve existing copy, empty state, or error message** — zero new widgets.
3. **Inline action or contextual disclosure** — inside an existing row, detail drawer, or menu.
4. **Section inside an existing page** — grouped with related controls.
5. **Replace an existing card/tab** — net-zero navigation growth.
6. **New top-level nav item or dashboard card** — requires explicit proof of frequent, standalone user value.

---

## Pre-build output template

```markdown
## Feature fit verdict: `<CUT | DEFAULT | INTEGRATE | REPLACE | NEW SURFACE>`

**Proposed change:** <1 sentence>
**User job & frequency:** <who needs this, when, and how often>

### Current surface check
- **Existing related surfaces:** `<route/file>` — <what already lives there>
- **Current clutter budget:** <e.g., 7 sidebar items, 5 overview cards>

### Placement comparison
| Option | Where | Pros | Cons |
| --- | --- | --- | --- |
| A (Inline) | `<file / component>` | ... | ... |
| B (Existing page) | `<file / route>` | ... | ... |
| C (New surface) | `<proposed location>` | ... | ... |

### Slop & subtraction check
- **Slop risks caught:** <list or "None">
- **Subtract or merge:** <what can be deleted/simplified in the same change>

### Recommendation
<Concrete 2-4 line placement plan, plus empty/loading/error/mobile notes if building.>
```

---

## Pre-push diff audit template

```markdown
## UI diff feature-fit audit (`<base>...<head>`)

| Added UI element | File | Type | Verdict | Action |
| --- | --- | --- | --- | --- |
| `<name>` | `<path:line>` | card / tab / toggle / banner / modal | `KEEP` / `MOVE INLINE` / `DEFAULT` / `REMOVE` | `<concrete 1-line fix>` |

**Summary:** <1-2 sentences on overall flow fit and whether the diff is ready to push.>
```
