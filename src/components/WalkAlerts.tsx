import type { WalkWarning } from "@/lib/walkTimes";

type Props = {
  warnings: WalkWarning[];
};

export default function WalkAlerts({ warnings }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Walk alerts</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Back-to-backs where the gap is shorter than UCLA walk time + 2 min. Boelter ↔ Bunche =
          12 min.
        </p>
      </div>

      {warnings.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No tight walks this week.</p>
      ) : (
        <ul className="space-y-2">
          {warnings.map((w, i) => (
            <li
              key={i}
              className="rounded-lg border border-[rgba(232,184,109,0.28)] border-l-2 border-l-[var(--warn)] bg-[var(--warn-bg)] px-4 py-3"
            >
              <p className="text-[13px] font-medium text-[var(--warn)]">Tight transition</p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground">{w.message}</p>
              <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] tabular text-muted-foreground">
                <span>
                  Gap <strong className="text-[var(--warn)]">{w.gapMin}m</strong>
                </span>
                <span>
                  Walk <strong className="text-[var(--warn)]">{w.walkMin}m</strong>
                </span>
                <span>
                  Need <strong className="text-[var(--warn)]">{w.walkMin + 2}m</strong>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
