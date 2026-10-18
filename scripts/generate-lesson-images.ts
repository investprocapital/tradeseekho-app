/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate professional lesson thumbnail images using sharp (no AI).
 *
 * Each image is a clean, branded card with:
 *   - TradeSeekho PK logo/branding
 *   - Lesson number + category color
 *   - Lesson title in English (proper spelling, no garbled text)
 *   - Professional gradient background
 *   - Icon/emoji per category
 *
 * Output: public/lessons/lesson-N.webp (max 80KB, quality 80)
 *
 * Run: bun run scripts/generate-lesson-images.ts
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const LESSONS_DIR = path.join(process.cwd(), "public", "lessons")

// Category metadata: color + icon emoji
const CATEGORIES = {
  beginner: { color: "#00D09C", icon: "🌱", name: "BEGINNER" },
  intermediate: { color: "#F3BA2F", icon: "📈", name: "INTERMEDIATE" },
  advanced: { color: "#FF6B6B", icon: "🎯", name: "ADVANCED" },
  bonus: { color: "#A855F7", icon: "⭐", name: "BONUS" },
}

// Lesson titles (English, proper spelling) — indexed by lesson number (1-50)
// Beginner: lessons 1-12
// Intermediate: lessons 13-22
// Advanced: lessons 30-45
// Bonus: lessons 46-50
const LESSON_TITLES = {
  1: { cat: "beginner", title: "What is Forex?" },
  2: { cat: "beginner", title: "Currency Pairs, Pips & Spread" },
  3: { cat: "beginner", title: "Lot Size, Leverage & Margin" },
  4: { cat: "beginner", title: "Market Sessions — 24/5 Market" },
  5: { cat: "beginner", title: "How to Read Candlesticks" },
  6: { cat: "beginner", title: "Support & Resistance Zones" },
  7: { cat: "beginner", title: "Trend & Trend Lines" },
  8: { cat: "beginner", title: "Order Types: Market, Limit, Stop" },
  9: { cat: "beginner", title: "Risk Management — 2% Rule" },
  10: { cat: "beginner", title: "Trading Psychology" },
  11: { cat: "beginner", title: "Demo Account Setup MT5" },
  12: { cat: "beginner", title: "Quiz + Level 1 Test" },
  13: { cat: "intermediate", title: "Moving Averages — MA & EMA" },
  14: { cat: "intermediate", title: "RSI Indicator — Overbought & Oversold" },
  15: { cat: "intermediate", title: "MACD Indicator — Momentum Strategy" },
  16: { cat: "intermediate", title: "Bollinger Bands — Volatility Trade" },
  17: { cat: "intermediate", title: "Chart Patterns 1: H&S, Double Top/Bottom" },
  18: { cat: "intermediate", title: "Chart Patterns 2: Triangles, Flags, Wedges" },
  19: { cat: "intermediate", title: "Fibonacci Retracement — Entry Points" },
  20: { cat: "intermediate", title: "Price Action — Pin Bar & Engulfing" },
  21: { cat: "intermediate", title: "Multiple Timeframe Analysis" },
  22: { cat: "intermediate", title: "Quiz + Level 2 Test" },
  30: { cat: "advanced", title: "Smart Money Concept (SMC) — Retail vs Banks" },
  31: { cat: "advanced", title: "Order Block (OB) — Where Banks Enter" },
  32: { cat: "advanced", title: "Fair Value Gap (FVG) / Imbalance" },
  33: { cat: "advanced", title: "Buy Side & Sell Side Liquidity" },
  34: { cat: "advanced", title: "Breaker Block & Mitigation Block" },
  35: { cat: "advanced", title: "Market Structure — BOS & CHOCH" },
  36: { cat: "advanced", title: "London Kill Zone — 12 PM to 3 PM PKT" },
  37: { cat: "advanced", title: "New York Kill Zone & Silver Bullet" },
  38: { cat: "advanced", title: "Pro Risk Management — 0.5% to 2% Scaling" },
  39: { cat: "advanced", title: "Advanced Psychology — FOMO, Revenge" },
  40: { cat: "advanced", title: "News + SMC — NFP, CPI, FOMC" },
  41: { cat: "advanced", title: "Top-Down Analysis — Daily > H1 > M15" },
  42: { cat: "advanced", title: "Build Your Pro Strategy — 1 Pair, 1 Setup" },
  43: { cat: "advanced", title: "BTC & Crypto — How to Apply SMC" },
  44: { cat: "advanced", title: "Live Trading Sessions — 3 Real Trades" },
  45: { cat: "advanced", title: "Withdrawal & Profit Management" },
  46: { cat: "bonus", title: "Prop Firm / Funded Account Rules" },
  47: { cat: "bonus", title: "When Not to Trade — Holidays & Dead Zones" },
  48: { cat: "bonus", title: "1 Year Career Roadmap — $100 to Pro" },
  49: { cat: "bonus", title: "Trading Journal — Track Every Trade" },
  50: { cat: "bonus", title: "Final Master Quiz — Pro Certificate" },
}

/**
 * Create an SVG image for a lesson, then convert to WebP via sharp.
 * SVG gives us crisp text + professional design, WebP keeps it small.
 */
function createLessonSVG(lessonNum) {
  const lesson = LESSON_TITLES[lessonNum]
  if (!lesson) return null

  const cat = CATEGORIES[lesson.cat]
  const W = 800
  const H = 450

  // Wrap title into multiple lines if too long
  const words = lesson.title.split(" ")
  const lines = []
  let currentLine = ""
  for (const w of words) {
    if ((currentLine + " " + w).trim().length > 38) {
      if (currentLine) lines.push(currentLine.trim())
      currentLine = w
    } else {
      currentLine = (currentLine + " " + w).trim()
    }
  }
  if (currentLine) lines.push(currentLine.trim())
  const titleLines = lines.slice(0, 3) // max 3 lines
  const fontSize = titleLines.length === 1 ? 38 : titleLines.length === 2 ? 32 : 26

  const titleY = H / 2 - (titleLines.length - 1) * (fontSize / 2)
  const titleSpans = titleLines.map((line, i) =>
    `<text x="${W / 2}" y="${titleY + i * (fontSize + 6)}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeXml(line)}</text>`
  ).join("\n")

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0B1B2E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0A1929;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${cat.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${cat.color};stop-opacity:0.7" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)" />

  <!-- Top accent bar -->
  <rect width="${W}" height="8" fill="url(#accent)" />

  <!-- Bottom accent bar -->
  <rect y="${H - 8}" width="${W}" height="8" fill="url(#accent)" opacity="0.5" />

  <!-- Category badge (top-left) -->
  <rect x="40" y="40" width="${cat.name.length * 9 + 40}" height="32" rx="16" fill="${cat.color}" opacity="0.2" />
  <text x="60" y="61" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${cat.color}">${cat.icon} ${cat.name}</text>

  <!-- Lesson number (top-right) -->
  <text x="${W - 40}" y="62" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#8AA2B8" text-anchor="end">LESSON ${lessonNum}</text>

  <!-- Large category icon (center, faded) -->
  <text x="${W / 2}" y="${H / 2 - 80}" font-family="Arial, sans-serif" font-size="72" text-anchor="middle" opacity="0.15">${cat.icon}</text>

  <!-- Title (centered, multi-line) -->
  ${titleSpans}

  <!-- Branding (bottom) -->
  <text x="${W / 2}" y="${H - 35}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#8AA2B8" text-anchor="middle">TradeSeekho PK · Learn · Trade · Grow</text>
</svg>`
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function generateAll() {
  if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true })

  const lessonNums = Object.keys(LESSON_TITLES).map(Number).sort((a, b) => a - b)
  console.log(`\n🎨 Generating ${lessonNums.length} professional lesson images\n`)

  let totalSize = 0
  let generated = 0
  let failed = 0

  for (const num of lessonNums) {
    const svg = createLessonSVG(num)
    if (!svg) { failed++; continue }

    try {
      let buffer = await sharp(Buffer.from(svg))
        .webp({ quality: 80, effort: 4 })
        .toBuffer()

      // If still over 80KB, reduce quality
      let q = 80
      while (buffer.length > 80 * 1024 && q > 30) {
        q -= 10
        buffer = await sharp(Buffer.from(svg))
          .webp({ quality: q, effort: 4 })
          .toBuffer()
      }

      const outputPath = path.join(LESSONS_DIR, `lesson-${num}.webp`)
      fs.writeFileSync(outputPath, buffer)
      totalSize += buffer.length
      generated++
      console.log(`  ✅ lesson-${num}.webp  ${(buffer.length / 1024).toFixed(1)}KB  ${LESSON_TITLES[num].title.slice(0, 40)}`)
    } catch (e) {
      console.error(`  ❌ lesson-${num}: ${e.message}`)
      failed++
    }
  }

  console.log(`\n${"═".repeat(60)}`)
  console.log("📊 GENERATION SUMMARY")
  console.log("═".repeat(60))
  console.log(`  Generated: ${generated}/${lessonNums.length}`)
  console.log(`  Failed:    ${failed}`)
  console.log(`  Total:     ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  Avg:       ${(totalSize / generated / 1024).toFixed(1)} KB/image`)
  console.log("═".repeat(60))
}

generateAll().catch((e) => {
  console.error("Generation failed:", e)
  process.exit(1)
})
