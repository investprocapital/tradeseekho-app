# Task 1 — full-stack-developer

Created `/home/z/my-project/src/lib/seed-advanced.ts` for Level 3: Advanced (16 lessons, 30-45) with 80 quiz questions in 4 languages (EN/UR/HI/AR).

## What was done
1. Read `src/lib/seed-intermediate.ts` to copy exact type definitions (QuizQ, LessonSeed) and the `seedIntermediateLessons()` function structure.
2. Created `seed-advanced.ts` (2240 lines) with:
   - 16 lessons: `eurusd-30` to `eurusd-45` (order 1-16).
   - Each lesson has title, summary, content in EN/UR/HI/AR (Urdu kept verbatim from user-provided Nastaliq script).
   - 5 MCQ questions per lesson × 16 = 80 MCQs, each with prompt/options[4]/correctIndex/explanation in all 4 languages.
   - Each lesson: `isFree: true`, `durationMin: 7`.
   - imageUrl formula: `/lessons/lesson-${ls.order + 29}.png` → lesson-30.png to lesson-45.png.
   - `seedAdvancedLessons(db: PrismaClient)` function that finds `advanced` category, deletes old lessons, creates lesson + quiz (passMark: 3) + 5 questions per lesson.

## Verification
- `rg -c 'type: "MCQ"' src/lib/seed-advanced.ts` → **81** (80 questions + 1 type def) ✓
- `rg -c 'id: "eurusd-' src/lib/seed-advanced.ts` → **16** ✓
- `bun run lint` → exit code **0**, no errors ✓
- File line count: **2240**

## Stage Summary
- Total lessons: 16 (eurusd-30 to eurusd-45)
- Total questions: 80 (5 per lesson)
- MCQ count (incl. type def): 81
- Lint status: PASS (0 errors)
- All 4 languages present: EN, UR, HI, AR
