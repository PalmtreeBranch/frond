# Report schema for `/beta-testers`

## 1. Per-persona subagent output

Every persona subagent MUST return a JSON object (fenced in `json`) matching this exact shape so the coordinator can merge and verify reliably:

```json
{
  "persona": {
    "id": "P1",
    "name": "Ingrid, 62; hesitant bakery owner",
    "archetype": "low-tech-hesitant",
    "viewport": "1280x800",
    "theme": "light",
    "mission": "Update Friday opening hours and verify they saved"
  },
  "outcome": "completed | completed_with_friction | blocked",
  "routes_visited": ["/portal", "/portal/hours"],
  "bugs": [
    {
      "title": "Double-clicking Save creates two duplicate holiday rows",
      "severity": "P0 | P1 | P2 | P3",
      "category": "functional | layout | responsive | accessibility | dark-mode | console-error | network-error",
      "url": "/portal/hours",
      "repro_steps": [
        "Open /portal/hours at 1280x800 light mode",
        "Fill 'Holiday name' with 'Midsommar'",
        "Double-click the 'Save' button quickly"
      ],
      "expected": "Button disables while saving and creates one row",
      "actual": "Two POST /api/hours requests fire and two identical rows appear",
      "evidence": {
        "screenshot": "p4-double-submit.png",
        "console_errors": [],
        "network_errors": ["POST /api/hours -> 200 (x2 within 90ms)"],
        "dom_or_aria_note": "Save button stayed enabled during in-flight request"
      }
    }
  ],
  "ux_friction": [
    {
      "title": "Pencil icon has no label or tooltip; hesitant user did not realize rows are editable",
      "url": "/portal/hours",
      "element": "Icon-only button inside schedule row",
      "impact": "Stalled for ~30 seconds before finding how to edit",
      "suggestion": "Add visible 'Edit' text or clear accessible label and hover affordance",
      "screenshot": "p1-unclear-edit-icon.png"
    }
  ],
  "notes": "Short 1-2 sentence summary of what worked well"
}
```

## Severity rubric

- **P0 (Blocker)**: Crash, blank screen, auth bypass/lockout, data loss, duplicate write/charge, or core journey impossible to complete.
- **P1 (Major)**: Flow breaks under normal/edge use (double-click, back button, mobile viewport, invalid input wipes form, 500 error, unhandled exception).
- **P2 (Visual / Layout / A11y)**: Horizontal overflow, overlapping controls, unreadable contrast, broken dark mode, missing focus outline, unlabeled interactive control, broken copy/i18n key.
- **P3 (Polish)**: Minor spacing, truncation on extreme strings, redundant click, small inconsistency.

---

## 2. Final consolidated developer report

The coordinator outputs ONE clean markdown report in this exact format:

```markdown
# Beta test report: <App or PR name>

- **Target:** `<url>` (`<mode>`)
- **Commit:** `<short-sha>`
- **Tester model:** `<tier / model slug>` (verifier: `<model>`)
- **Panel:** `<completed>/<N>` personas completed
- **Evidence dir:** `<path>`
- **Summary:** `<P0> P0 · <P1> P1 · <P2> P2 · <P3> P3 · <friction> UX friction items`

## Bugs (reproducible, sorted by severity)

### [BT-01] <Short concrete title>: `P1`
- **Hit by:** `3/<N>` personas (Double-clicker, Mobile-first, Low-tech)
- **Category:** `functional`
- **Route / Likely source:** `/portal/hours` (`components/portal/HoursEditor.tsx`)
- **Environment:** `1280x800 light`, `390x844 light`
- **Repro steps:**
  1. ...
  2. ...
  3. ...
- **Expected:** ...
- **Actual:** ...
- **Evidence:** `<screenshot path>`, console/network note
- **Fix target:** Disable submit while mutation is pending + dedupe/idempotency key on `POST /api/hours`.

## High-signal UX friction

| # | Screen | Hit by | What confused users | Suggested improvement |
| --- | --- | --- | --- | --- |
| UX-01 | `/portal/hours` | 2/10 (Low-tech, First-timer) | ... | ... |

## Persona coverage

| ID | Persona | Device / Theme | Mission | Outcome | Bugs |
| --- | --- | --- | --- | --- | --- |
| P1 | ... | `1280x800 light` | ... | `completed_with_friction` | `BT-02` |

## Recommended fix order

1. **BT-01**: reason + suggested automated regression check.
2. ...
```
