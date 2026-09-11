"use client"

import {
  Sprout, LineChart, Trophy, BookOpen, TrendingUp, Wallet,
  Brain, ShieldCheck, Activity, Coins, type LucideProps,
} from "lucide-react"
import type { ComponentType } from "react"

// Map a category icon name (stored in DB) -> a Lucide component.
const MAP: Record<string, ComponentType<LucideProps>> = {
  Sprout, LineChart, Trophy, BookOpen, TrendingUp, Wallet, Brain, ShieldCheck, Activity, Coins,
}

/** Stable component that renders the icon for a category name. */
export function CategoryIcon({ name, ...props }: { name: string | null | undefined } & LucideProps) {
  const Cmp = (name && MAP[name]) || BookOpen
  return <Cmp {...props} />
}
