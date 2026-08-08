import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  hasSyllabusExtras: boolean;
  hasPreferences: boolean;
  onGoPreferences?: () => void;
};

export default function OnboardingChecklist({
  hasSyllabusExtras,
  hasPreferences,
  onGoPreferences,
}: Props) {
  const items = [
    {
      id: "syllabus",
      label: "Add a syllabus",
      done: hasSyllabusExtras,
      hint: "Load the sample below and parse it in.",
    },
    {
      id: "prefs",
      label: "Set preferences",
      done: hasPreferences,
      hint: "Gym / quiet hours — empty ≠ available.",
      action: onGoPreferences,
    },
    {
      id: "gcal",
      label: "Connect calendar",
      done: false,
      hint: "Coming soon (Phase 2)",
      disabled: true,
    },
  ];

  return (
    <Card className="border-border bg-[var(--surface)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Build your week</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border/60 px-3 py-2.5",
                item.disabled && "opacity-60"
              )}
            >
              {item.done ? (
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--green)]" aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.disabled && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.hint}</p>
                {item.action && !item.done && (
                  <button
                    type="button"
                    onClick={item.action}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    Open Preferences
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
