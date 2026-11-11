import { db } from "@/lib/db"
import { withDbRetry } from "@/lib/db-retry"

/**
 * App Settings manager — reads the AppSettings singleton (appMode,
 * customDomain, vercelUrl, maintenanceMode) from the DB.
 *
 * Cache: 60s in-memory cache so we don't hit the DB on every URL lookup.
 * The admin panel invalidates the cache when settings are saved.
 *
 * getAppUrl() returns the EFFECTIVE app URL based on appMode:
 *   - "vercel" → vercelUrl (https://tradeseekhopk.vercel.app)
 *   - "custom" → customDomain (https://tradeseekhopk.com)
 *
 * This URL is used in share links, certificate verification, password-reset
 * emails, etc. — anywhere the app needs to know its own public URL.
 */

export interface AppSettingsData {
  appMode: "vercel" | "custom"
  vercelUrl: string
  customDomain: string
  maintenanceMode: boolean
  maintenanceMessage: string
}

const DEFAULTS: AppSettingsData = {
  appMode: "vercel",
  vercelUrl: "https://tradeseekhopk.vercel.app",
  customDomain: "https://tradeseekhopk.com",
  maintenanceMode: false,
  maintenanceMessage: "We're upgrading TradeSeekho PK. Back soon — Insha'Allah!",
}

let cached: AppSettingsData | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

/** Get app settings from DB (cached 60s). Falls back to defaults on error. */
export async function getAppSettings(): Promise<AppSettingsData> {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached

  try {
    const row = await withDbRetry(() =>
      db.appSettings.findUnique({ where: { id: "singleton" } }),
    )
    cached = row
      ? {
          appMode: (row.appMode === "custom" ? "custom" : "vercel") as "vercel" | "custom",
          vercelUrl: row.vercelUrl || DEFAULTS.vercelUrl,
          customDomain: row.customDomain || DEFAULTS.customDomain,
          maintenanceMode: row.maintenanceMode,
          maintenanceMessage: row.maintenanceMessage || DEFAULTS.maintenanceMessage,
        }
      : DEFAULTS
  } catch {
    cached = DEFAULTS
  }
  cacheTime = Date.now()
  return cached
}

/**
 * Get the EFFECTIVE app URL based on current appMode.
 *   - "vercel" → https://tradeseekhopk.vercel.app
 *   - "custom" → https://tradeseekhopk.com
 *
 * Use this for share links, certificate URLs, password-reset links, etc.
 */
export async function getAppUrl(): Promise<string> {
  const s = await getAppSettings()
  return s.appMode === "custom" ? s.customDomain : s.vercelUrl
}

/** Invalidate the cache (called when admin saves new settings). */
export function invalidateAppSettingsCache(): void {
  cached = null
}
