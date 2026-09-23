# Task ID: 15 — Fix Hindi content in seed-eurusd.ts (Lessons 1-12)

**Agent**: full-stack-developer
**File**: `src/lib/seed-eurusd.ts`
**Goal**: Expand each lesson's `content.hi` to match English/Urdu structure & detail.

## What was done

For each of the 12 EUR/USD beginner lessons (eurusd-1 to eurusd-12):
1. Read English (`en`) and Urdu (`ur`) content as reference.
2. Replaced the short Hindi (`hi`) stub (52–138 chars) with a full translation that:
   - Uses proper Devanagari Hindi script (not Roman).
   - Keeps the same markdown structure (## / ### headings, **bold**, numbered lists, `code` blocks, tables).
   - Preserves technical terms in English (Forex, EUR/USD, Pips, Spread, Lot, Leverage, Margin, Support, Resistance, MT5, SL, TP, etc.) — same convention as the Urdu version.
3. After first pass, lesson 8 Hindi was 257 chars vs English 345 — re-edited to add fuller explanations matching the English source.

## Result

All 12 lessons now have Hindi content matching English/Urdu in structure and detail.

| Lesson | EN  | UR  | HI (old) | HI (new) |
|--------|-----|-----|----------|----------|
| eurusd-1  | 550 | 591 | 138 | 591 |
| eurusd-2  | 195 | 308 |  97 | 318 |
| eurusd-3  | 638 | 710 |  75 | 739 |
| eurusd-4  | 586 | 652 |  64 | 698 |
| eurusd-5  | 356 | 331 |  64 | 356 |
| eurusd-6  | 319 | 277 |  52 | 309 |
| eurusd-7  | 265 | 238 | 105 | 259 |
| eurusd-8  | 345 | 251 |  52 | 355 |
| eurusd-9  | 286 | 265 |  75 | 286 |
| eurusd-10 | 235 | 199 |  64 | 225 |
| eurusd-11 | 426 | 387 |  64 | 457 |
| eurusd-12 | 542 | 458 |  52 | 490 |

## Verification

- `bun run lint` — 0 errors.
- `rg -c 'id: "eurusd-' src/lib/seed-eurusd.ts` — 12 (correct lesson count).
- `rg -c "contentHi" src/lib/seed-eurusd.ts` — 1 (the string `contentHi` appears once in the seed-mapping function `ls.content.hi → contentHi` and runs 12 times at runtime).
- en / ur / ar content untouched.
- No syntax errors (unmatched backticks, etc.).

## Notes for downstream agents

- Lessons 7, 9, 10 have Hindi content under 300 chars because the source English itself is short (265 / 286 / 235 chars). The Hindi correctly matches the English — there is no missing content; the source just doesn't have more to translate.
- All technical terms (Forex, EUR/USD, Pips, Spread, etc.) are intentionally kept in English in the Hindi version, matching the convention used by the Urdu version.
