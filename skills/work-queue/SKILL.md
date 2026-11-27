---
name: work-queue
description: "Work through an ordered list of tasks or Linear/GitHub issues to the agreed done level, one issue per branch and one branch per PR, keeping one live status table and handing finished PRs to land-pr. Handles blockers without stalling independent items and keeps scope strictly bounded. Use for /work-queue, 'proceed in this order: 1... 2...', 'file issues for these and work through them', 'do ABC-123 and ABC-130', or when executing an approved numbered plan."
---

# Work queue

Execute an ordered list of tasks cleanly: **one issue, one branch, one pull request** at a time, with one live status table the user can read at any moment.

Read [`../../docs/harness.md`](../../docs/harness.md) when delegating parallel items across worktrees.

## Inputs

- **Ordered list:** issue keys, short descriptions, or a mix, in the user's order.
- **Per-item scope notes:** e.g. `"option 2"`, `"replay part only"`, `"quick fix today, real fix later"`. Keep these verbatim.
- **Done level:** `PR open`, `merged`, `merged when green`, or `live` (default from project config).
- **Optional stop conditions:** e.g. `"stop after item 3"` or `"ask me before touching billing"`.

## Project configuration

Read from `AGENTS.md` or `~/.config/frond/project.md` (infer sensible defaults when absent):
- **Issue tracker:** Linear, GitHub Issues, or Jira, plus team/project key.
- **Branch naming pattern:** e.g. `<tool>/<issue-key>-<slug>`.
- **Worktree location & parallelism:** whether parallel worktrees are allowed and max concurrent items (default `1` if shared checkout constraints apply, or `2-3` for clean independent slices).
- **Default done level:** e.g. `PR open` or `merged when green`.
- **Risk rules:** which paths/labels trigger [`/feature-fit`](../feature-fit/SKILL.md), [`/beta-testers`](../beta-testers/SKILL.md), [`/pre-ship-review`](../pre-ship-review/SKILL.md), [`/council`](../council/SKILL.md), or human approval before opening/merging a PR.
- **Local check command:** fast affected checks/type-check/lint command (never run a slow full CI suite locally unless asked).

---

## Workflow

### 1. Parse and show the queue
1. Turn each entry into one numbered item in the user's order, preserving its scope note verbatim.
2. If an entry is a description without an issue key, **search the tracker first** for an existing match. File a new issue (title, reason, acceptance criteria) only when none exists.
3. Show the parsed status table once.
4. Start immediately unless an item is genuinely unclear — if one item is unclear, ask about that item only and start the other independent items.

### 2. Plan sequential vs parallel execution
Run items **in sequence** when:
- Item B depends on Item A's change.
- Both touch the same files or migrations.
- They must ship in one release order.

Independent items may run **in parallel**, each in its own worktree, up to the configured limit. Keep the user's order unless a dependency forces a swap — if you change order, state why in one line in the `Note` column.

### 3. Execute each item
For each item in its own branch (and worktree when parallel):
1. Fetch the latest base branch and create `<branch>` from it (so sequential Item 2 includes Item 1 if Item 1 merged).
2. Read the issue and all its comments.
3. Set the issue state to **In progress**.
4. Implement **the scope note and nothing more**.
5. Run the local affected checks and lint.
6. Commit explicit file paths with the issue key (never `git add -A`, never `git stash`, never tidy untouched files).
7. Open a pull request whose title and body link the issue.
8. Run any review required by the project's risk rules (`feature-fit`, `beta-testers`, `pre-ship-review`, or `council`).
9. Hand the PR to [`/land-pr`](../land-pr/SKILL.md) at the configured done level (when done level is `merged`, `merged when green`, or `live`).
10. Update the issue with the PR link and verified final state. Close the issue only when its done level is reached.

### 4. Handle blocked items without stalling
An item is **Blocked** when it needs:
- A product or design decision from the user
- A secret, credential, or permission the agent lacks
- An external party
- Fixing after failing **2 CI rounds**

When blocked:
1. Mark the item `Blocked` with the exact question or missing prerequisite in `Note`.
2. Continue to the next **independent** item (dependent items stay `Queued` with a note).
3. Batch all open blocker questions together instead of interrupting once per item.

### 5. Keep scope strictly bounded
Anything out of scope discovered along the way becomes a **new issue** labeled or titled `Found while working on <key>`. Never fix unrelated problems on the current item's branch without asking.

### 6. Live status table
Keep this table updated and display it on completion or whenever the user asks `"status"`:

```markdown
| # | Issue | Title | State | PR | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | ABC-123 | Fix double submit on save | Live | #42 | Verified at 14:12 |
| 2 | ABC-124 | Add CSV export button | Blocked | — | Needs decision: inline menu or toolbar? |
```

Allowed states: `Queued`, `Working`, `PR open`, `In review`, `Merged`, `Live`, `Blocked`, `Skipped`.

## Hard rules
- **One issue = one branch = one pull request.** Never bundle multiple queue items into one branch unless explicitly told to.
- Never start work the user did not list. Propose extra work as a new issue instead.
- **Stop immediately** if the user says stop, leaving every item in a clean, accurately reported state.
- Respect the 2-round CI cap and all project risk rules.
- Never delete or close issues the user did not list.
- Shared checkouts: commit explicit paths only, never `git stash`, and never edit files outside the current item's scope.
