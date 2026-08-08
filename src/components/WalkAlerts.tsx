import type { WalkWarning } from "@/lib/walkTimes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  warnings: WalkWarning[];
};

export default function WalkAlerts({ warnings }: Props) {
  return (
    <Card className="border-border bg-[var(--surface)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tight walk transitions</CardTitle>
        <CardDescription>
          Flags back-to-backs where the gap is shorter than UCLA walk time + 2 min (Boelter ↔
          Bunche = 12 min).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tight walks in your current schedule. Nice!
          </p>
        ) : (
          <ul className="space-y-3">
            {warnings.map((w, i) => (
              <li
                key={i}
                className="rounded-xl border border-[rgba(240,198,116,0.4)] border-l-4 border-l-[var(--warn)] bg-[var(--warn-bg)] p-4"
              >
                <h3 className="mb-1.5 text-sm font-semibold text-[var(--warn)]">
                  Tight transition
                </h3>
                <p className="text-sm leading-relaxed text-foreground">{w.message}</p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-black/20 px-2.5 py-1">
                    Gap: <strong className="text-[var(--warn)]">{w.gapMin} min</strong>
                  </span>
                  <span className="rounded-md bg-black/20 px-2.5 py-1">
                    Walk: <strong className="text-[var(--warn)]">{w.walkMin} min</strong>
                  </span>
                  <span className="rounded-md bg-black/20 px-2.5 py-1">
                    Need: <strong className="text-[var(--warn)]">{w.walkMin + 2} min</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
