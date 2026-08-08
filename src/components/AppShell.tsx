"use client";

import { cn } from "@/lib/utils";

export type AppTab = "week" | "preferences" | "overlap" | "walk";

const NAV: { id: AppTab; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "preferences", label: "Preferences" },
  { id: "overlap", label: "Find time" },
  { id: "walk", label: "Walks" },
];

type Props = {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
  calendarConnected?: boolean;
  onConnectCalendar?: () => void;
};

export default function AppShell({
  tab,
  onTabChange,
  children,
  calendarConnected,
  onConnectCalendar,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-[var(--hairline)] bg-[var(--bg)] md:h-screen md:w-[200px] md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:block md:px-4 md:pt-5 md:pb-6">
          <div className="text-[15px] font-semibold tracking-tight">IntelliCal</div>
          <div className="hidden text-[12px] text-[var(--text-tertiary)] md:mt-1 md:block">
            Schedule that knows you
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:pb-0"
          aria-label="Main"
        >
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-[4px] px-3 py-2 text-left text-[13px] transition-colors md:w-full",
                  active
                    ? "bg-[var(--elevated)] font-medium text-[var(--text)]"
                    : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-[var(--hairline)] p-3 md:block">
          {calendarConnected ? (
            <p className="px-1 text-[12px] text-[var(--text-secondary)]">
              Calendar connected
            </p>
          ) : (
            <button
              type="button"
              onClick={onConnectCalendar}
              className="w-full rounded-[4px] border border-[var(--hairline-strong)] px-3 py-2 text-left text-[12px] text-[var(--text)] transition-colors hover:bg-[var(--elevated)]"
            >
              Connect calendar
              <span className="mt-0.5 block text-[11px] font-normal text-[var(--text-tertiary)]">
                Demo import · real OAuth later
              </span>
            </button>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">{children}</main>
    </div>
  );
}
