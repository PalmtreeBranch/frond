---
name: sharpen
description: "Turn a rough idea, prompt, or Linear/GitHub ticket into a deeper (not bigger) build brief before writing code: surfaces what a top practitioner would check, raw ground-truth sources, cheap experiments to settle technical forks, and clear product choices left to the founder. Does not implement the task. Use for /sharpen before starting an ambiguous build."
disable-model-invocation: true
---

# Sharpen

Make a task **deeper, not bigger**, before spending tokens building the wrong thing. Do not implement the task; hand back a crisp, execution-ready brief.

## Steps

Before rewriting the prompt or ticket, inspect the relevant repo context briefly (if in a codebase) and answer four concrete questions:

1. **What a top practitioner would catch that is missing:** the real edge case, constraint, failure mode, or simplification an experienced founder/engineer would check up front: without inflating scope.
2. **The rawest source of truth to start from:** exact files, schemas, live traffic/logs, existing user flows, or vendor docs to read instead of second-hand summaries or guesses.
3. **Methods and experiments:** which technical forks can be settled cheaply by running a quick probe or tiny prototype instead of debating in theory.
4. **External proof of done:** what concrete artifact outside the agent's own words proves the result works (a failing-then-passing check, a live browser screenshot, a real API response, or a [`/beta-testers`](../beta-testers/SKILL.md) pass).

## Output

1. Four tight bullets answering questions 1-4 (no fluff, cite real repo files when applicable).
2. **Sharpened brief / prompt:** a clean, ready-to-run prompt or Linear ticket description that:
   - Keeps scope small and concrete (pair with [`/feature-fit`](../feature-fit/SKILL.md) if adding visible UI).
   - Tells the builder to settle empirical/technical forks by running a small probe or prototype and recommending the winner.
   - Explicitly lists the **1-3 product or UX calls** that only the human can make, so the agent does not silently guess them.
