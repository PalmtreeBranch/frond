---
name: locale-craft
description: "Multi-language software copy, localization quality, and cross-skill language adapter: builds per-language style guides and glossaries, writes native non-translationese UI copy directly from the real source language, catches ICU/tag/length/register bugs, and adapts /beta-testers, /feature-fit, and writing style to the project's locales. Use for /locale-craft, translating or auditing UI copy, setting up a new locale, or adapting skills to non-English products."
---

# Locale craft

Write and audit multi-language software copy so every locale reads like a native product, not an English template run through machine translation. Also feeds language constraints into [`/beta-testers`](../beta-testers/SKILL.md), [`/feature-fit`](../feature-fit/SKILL.md), and [`/frond-mode`](../frond-mode/SKILL.md).

Read [`references/language-profiles.md`](./references/language-profiles.md) for built-in defaults (Swedish, English, Dutch, Finnish, Norwegian, Danish, French, German) and the per-language style guide template.

## Three modes

1. **Bootstrap a locale guide** (`/locale-craft init <locale>`): inspect the repo's i18n setup and generate or update `docs/i18n/<LOCALE>-STYLE.md` (source locale, formality register, banned local AI-slop words, button length budget, never-translate list, and one-term-per-concept glossary).
2. **Translate or audit UI copy** (`/locale-craft` on a diff, file, or feature): write native copy or audit existing locales for translationese, register drift, glossary violations, ICU/tag corruption, hardcoded JSX strings, and button overflow.
3. **Adapt another skill to a language** (`/locale-craft adapt <skill> <locale>`): produce a compact **Locale Context Block** that any other skill (`beta-testers`, `feature-fit`, `frond-mode`) injects into its prompts.

---

## Step 1: Discover the repo's i18n ground truth

Never guess the source language or invent terms. Inspect first:
1. Locate translation catalogs (`messages/<locale>/`, `locales/`, `i18n/`, `.po`, `.arb`, `.strings`).
2. Identify the **true source language** (for example, Swedish `sv`, not English `en`). Always translate from the source language directly — never pivot through English unless English is the source.
3. Read any existing glossaries or style guides (`docs/i18n/`, `GLOSSARY.md`, `DESIGN.md`, `AGENTS.md` copy rules).
4. Identify hard repo copy rules (for example: no em dashes, sentence case headings, banned brand terms, product/plan names that never translate).

---

## Step 2: Native writing & anti-slop rules

Apply these rules to every string you write or review:

1. **Meaning first, word order second.** Read the string aloud in the target language. If a native speaker would never say it, rewrite from the intent instead of mirroring the source sentence structure.
2. **Match the source temperature.** If the source is plain and direct, the translation must be plain and direct. Never inflate plain copy with marketing hype.
3. **Ban local AI-slop tells.** Check [`references/language-profiles.md`](./references/language-profiles.md) for each language's banned machine-translation buzzwords (the local equivalents of *seamless*, *delve*, *unlock*, *elevate*, *crucial*).
4. **Hold one register per locale.** Never mix formal and informal pronouns (`u`/`je`, `Sie`/`Du`, `vous`/`tu`, `ni`/`du`) inside one product or string.
5. **Hold one term per concept.** Follow the project glossary strictly. Whenever you encounter a new domain term not in the glossary, choose one clear term, stay consistent across the entire diff, and list it under `NEWTERMS` in your report.
6. **Respect UI length budgets.** Buttons, tabs, nav items, and table headers must stay compact — especially in Dutch, German, French, and Finnish, which expand 20-40% over English or Swedish. Never let a translated button wrap awkwardly or clip at `390px` mobile.

---

## Step 3: Hard technical safety checks

A broken placeholder is a runtime crash, not a copy nit. Verify every modified catalog against the source locale:

- **Key parity:** every added/removed key in the source locale is mirrored across every target locale; arrays preserve length and order; empty strings stay empty.
- **ICU arguments intact:** `{name}`, `{count, plural, =1 {...} other {...}}`, `{n, number}`, `{when, date}` keep identical variable names and plural/select branches.
- **Rich-text tags intact:** `<link>...</link>`, `<b>...</b>`, `<strong>...</strong>` keep identical tag names and nesting.
- **ICU apostrophe safety:** in ICU MessageFormat catalogs, watch out for straight `'` next to braces `{}` (use typographic `’` or properly escaped quotes where the library requires it).
- **Formatting & whitespace:** preserve `\n` breaks and intentional leading/trailing spaces; never hardcode locale-specific dates, times, decimal separators, or currency symbols when `Intl` / the i18n library should format them.
- **Never-translate list intact:** brand names, plan names, URLs, route paths (`/portal/...`), API keys, env vars, and code identifiers stay untouched.
- **No inline JSX/template leaks:** flag any newly added user-facing string written inline in components instead of the message catalog.

---

## Step 4: Cross-skill language hooks

When working in a multi-language repo, other `frond` skills pull a short **Locale Context Block** from `locale-craft`:

- **For [`/beta-testers`](../beta-testers/SKILL.md):** assign at least 2 of the 10 personas to non-default locales (especially the longest-string locale, such as `de`, `fi`, `nl`, or `fr`) to catch clipped buttons at `390x844`, untranslated keys, mixed-language screens, wrong date/currency formats, and unnatural copy.
- **For [`/feature-fit`](../feature-fit/SKILL.md):** test proposed nav labels, tab names, and dashboard button copy in the **longest** supported locale before approving a placement. A tight 5-tab bar that fits in English often overflows in German or Finnish.
- **For [`/frond-mode`](../frond-mode/SKILL.md) / writing style:** adapt plain-language writing discipline to the active language (for example, English ASD-STE100, Swedish *klarspråk*, plain direct Dutch/German/French) instead of forcing English idioms into another language.

---

## Report format (audit or translation run)

Return one concise summary:
- **Source locale & target locales touched**
- **Technical checks:** key parity, ICU/tag safety, inline string leaks, punctuation/em-dash rule (pass/fail with exact file:key)
- **Style & register issues fixed** (or flagged in audit mode)
- **Layout length warnings:** any label/button > 1.3x source length
- **`NEWTERMS`:** new domain terms introduced that should be added to the project glossary
