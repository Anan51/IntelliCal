import { cn } from "@/lib/utils";

type Props = {
  hasSyllabusExtras: boolean;
  prefCount: number;
  walkCount: number;
  onGoPreferences: () => void;
  onGoSyllabus?: () => void;
};

export default function OnboardingChecklist({
  hasSyllabusExtras,
  prefCount,
  walkCount,
  onGoPreferences,
}: Props) {
  const items = [
    {
      done: hasSyllabusExtras,
      label: "Syllabus on calendar",
      actionLabel: !hasSyllabusExtras ? "Add below" : null,
    },
    {
      done: prefCount > 0,
      label: `${prefCount} preference${prefCount === 1 ? "" : "s"} set`,
      actionLabel: "Edit prefs",
      onAction: onGoPreferences,
    },
    {
      done: false,
      label: "Connect Google Calendar",
      soon: true,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
      {items.map((item) => (
        <div key={item.label} className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              item.done ? "bg-[var(--green)]" : item.soon ? "bg-white/20" : "bg-primary/60"
            )}
            aria-hidden
          />
          <span className={cn(item.done && "text-foreground/80")}>{item.label}</span>
          {item.soon && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/50">
              soon
            </span>
          )}
          {item.actionLabel && item.onAction && (
            <button
              type="button"
              onClick={item.onAction}
              className="text-primary hover:underline"
            >
              {item.actionLabel}
            </button>
          )}
          {item.actionLabel && !item.onAction && !item.done && (
            <span className="text-muted-foreground/70">{item.actionLabel}</span>
          )}
        </div>
      ))}
      {walkCount > 0 && (
        <span className="text-[var(--warn)]">
          {walkCount} tight walk{walkCount === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
