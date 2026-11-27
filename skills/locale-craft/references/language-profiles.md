# Language profiles & style guide template

Built-in starting profiles for `/locale-craft`. Project-specific files (`docs/i18n/<LOCALE>-STYLE.md`, `GLOSSARY.md`) always override these defaults.

## Built-in starting profiles

| Locale | Register default (verify per product) | Common expansion vs English | Common AI-slop / translationese tells to ban | Compound & punctuation traps |
| --- | --- | --- | --- | --- |
| **Swedish (`sv-SE`)** | Informal `du` (even for B2B; avoid stiff `ni` unless addressing a group) | ~1.0x | *sömlös*, *banbrytande*, *lyfta till nästa nivå*, *i dagens snabba värld*, *nyckelroll*, *utforska hur*, anglicisms (*spara tid* over *maximera effektivitet*) | Compound nouns are ONE word (*bokningsbekräftelse*, never *boknings bekräftelse*). Follow *klarspråk*: active verbs, short sentences, sentence case. |
| **English (`en`)** | Plain direct `you` | 1.0x | *seamless*, *delve*, *crucial*, *pivotal*, *unlock*, *elevate*, *landscape*, *robust*, *harness*, *empower*, *leverage* | Use sentence case in UI labels unless the repo uses title case. Avoid em dashes if banned by the product. |
| **Dutch (`nl-NL`)** | Informal `je/jij/jouw` (confirm `u/uw` only for formal enterprise/legal) | ~1.15-1.30x | *naadloos*, *krachtig(e)*, *revolutionair*, *baanbrekend*, *ontgrendel*, *duik in*, *tilt naar een hoger niveau*, *cruciaal* | Compound nouns are joined (*reserveringssysteem*). Keep daily loanwords (`e-mail`, `app`, `link`, `demo`). Use typographic `’` in ICU strings (`auto’s`, `’s ochtends`). |
| **Finnish (`fi-FI`)** | Informal `sinä` or passive UI verbs (avoid stiff `te` unless formal) | ~1.20-1.40x | Literal English word order, overused *saumaton*, *mullistava*, *avaa uusia mahdollisuuksia*, unnatural nominal chains | Long inflected words break narrow buttons and table headers fast; always test at `390px` mobile. Check cases around `{name}` variables! |
| **Norwegian (`nb-NO`)** | Informal `du` | ~1.0x | *sømløs*, *banebrytende*, *ta til neste nivå*, Swedish false friends (*rolig* = calm in NO, fun in SV; *anledning* = occasion vs reason) | Compound nouns are ONE word. Never copy Swedish phrasing verbatim. |
| **Danish (`da-DK`)** | Informal `du` | ~1.0-1.05x | *problemfri* overused, *banebrydende*, Swedish false friends (*frokost* = lunch in DA, breakfast in SV; *rar* = nice in DA, weird in NO) | Compound nouns are ONE word. Check numbers (`1.000,50` format via `Intl`). |
| **French (`fr-FR`)** | Formal `vous` by default for B2B/customers (confirm `tu` only for casual consumer apps) | ~1.20-1.35x | *transparent* for seamless, *révolutionnaire*, *propulser*, *plongez dans*, *débloquer*, *paysage* | Non-breaking space before `:`, `;`, `?`, `!` (`Enregistrer :`). Buttons grow significantly; abbreviate naturally. |
| **German (`de-DE`)** | Confirm `Du` vs `Sie` per product (never mix) | ~1.25-1.40x | *nahtlos*, *bahnbrechend*, *auf das nächste Level heben*, *tauche ein*, *entscheidend* | Long compound nouns clip on mobile (`Terminbestätigung`); capitalize all nouns (`Einstellungen`). |

---

## Template: `docs/i18n/<LOCALE>-STYLE.md`

Use this compact structure when `/locale-craft init <locale>` creates a repo style guide:

```markdown
# <Product>: <Language> (<locale>) style guide and glossary

- **Source locale:** `<source>` (translate from `<source>`, never through English unless English is the source)
- **Market variant:** `<e.g., nl-NL, sv-SE, fr-FR>`
- **Register:** `<e.g., informal du / je, or formal vous / Sie; never mix>`
- **Case & punctuation:** `<sentence case headings; no em dashes; typographic apostrophe ’ for ICU safety>`
- **Length budget:** `<keep buttons/tabs compact; verify at 390px mobile>`

## Voice & banned tells
- Plain, direct tone matching the source. No hype the source does not have.
- Banned machine-translation words: `<list>`

## Hard technical rules
- Preserve all keys, array lengths, `{placeholders}`, ICU plural/select syntax, and `<tags>`.
- Never translate: `<brand names, plan names, routes, env vars, code>`

## Domain glossary (one source term -> one target term)

| Source (`<source>`) | Target (`<locale>`) | Note |
| --- | --- | --- |
| `<term>` | `<translation>` | `<context / false-friend note>` |
```
