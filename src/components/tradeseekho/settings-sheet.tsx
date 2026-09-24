"use client"

import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, Moon, Sun, User as UserIcon } from "lucide-react"
import { useStore } from "@/lib/store"

export function SettingsSheet() {
  const open = useStore((s) => s.settingsOpen)
  const setOpen = useStore((s) => s.setSettingsOpen)
  const setEditProfileOpen = useStore((s) => s.setEditProfileOpen)
  const { theme, setTheme } = useTheme()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Shield className="h-5 w-5 text-brand" /> Settings
          </SheetTitle>
          <SheetDescription>Theme, notifications & account.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="ts-scroll flex-1">
          <div className="space-y-1 p-4">
            {/* Account */}
            <Section title="Account">
              <Row icon={UserIcon} label="Edit profile" hint="Change name & password"
                onClick={() => { setOpen(false); setEditProfileOpen(true) }} />
            </Section>

            <Separator className="my-3" />

            {/* Theme */}
            <Section title="Appearance">
              <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {theme === "dark" ? <Moon className="h-4 w-4 text-brand" /> : <Sun className="h-4 w-4 text-brand" />}
                  Dark theme
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
              </div>
            </Section>

            <Separator className="my-3" />

            {/* Notifications */}
            <Section title="Notifications">
              <Toggle icon={Bell} label="Quiz results" defaultChecked />
              <Toggle icon={Bell} label="New lessons" defaultChecked />
              <Toggle icon={Bell} label="Market signals" defaultChecked />
            </Section>

            <Separator className="my-3" />

            {/* Privacy */}
            <Section title="Privacy">
              <Row icon={Shield} label="Progress sharing" hint="Show me on the leaderboard" />
              <Row icon={Shield} label="Analytics" hint="Anonymous usage helps improve the app" />
            </Section>

            <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
              TradeSeekho PK v1.0 · Made for learners
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function Row({ icon: Icon, label, hint, onClick }: { icon: any; label: string; hint?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex h-full w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition hover:bg-muted/40">
      <Icon className="h-4 w-4 text-brand" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
    </button>
  )
}

function Toggle({ icon: Icon, label, defaultChecked }: { icon: any; label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4 text-brand" /> {label}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
