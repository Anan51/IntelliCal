"use client";

import { CalendarDays, Clock3, Footprints, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "week" | "preferences" | "overlap" | "walk";

const NAV: {
  id: AppTab;
  label: string;
  hint: string;
  icon: typeof CalendarDays;
}[] = [
  { id: "week", label: "My Week", hint: "Classes + prefs", icon: CalendarDays },
  { id: "preferences", label: "Preferences", hint: "Protect your time", icon: Settings2 },
  { id: "overlap", label: "Find time", hint: "You × Alex", icon: Clock3 },
  { id: "walk", label: "Walks", hint: "Tight transitions", icon: Footprints },
];

type Props = {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  prefCount: number;
  walkCount: number;
  children: React.ReactNode;
};

export default function AppShell({
  tab,
  onTabChange,
  prefCount,
  walkCount,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — Notion/Linear restraint */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--sidebar)] px-3 py-5 md:flex">
        <div className="mb-8 px-2">
          <div className="text-[15px] font-semibold tracking-tight text-foreground">
            IntelliCal
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Classes. Prefs. Walk times.
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            const badge =
              item.id === "preferences"
                ? prefCount
                : item.id === "walk"
                  ? walkCount
                  : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  active
                    ? "bg-[var(--elevated)] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium leading-none">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground/80">
                    {item.hint}
                  </span>
                </span>
                {badge != null && badge > 0 && (
                  <span className="tabular rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--hairline)] px-2 pt-4">
          <p className="text-[10px] leading-relaxed text-muted-foreground/70">
            Demo week · Sep 28 – Oct 2
            <br />
            No login required
          </p>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[var(--hairline)] bg-[var(--bg)]/90 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-[15px] font-semibold tracking-tight">IntelliCal</div>
            <span className="text-[10px] text-muted-foreground">Demo · no login</span>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto px-2 pb-2"
            aria-label="Main"
          >
            {NAV.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-[var(--elevated)] text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="animate-fade-up flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
