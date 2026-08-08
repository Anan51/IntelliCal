import type { WalkWarning } from "@/lib/walkTimes";

type Props = {
  warnings: WalkWarning[];
};

export default function WalkAlerts({ warnings }: Props) {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-[20px] font-semibold tracking-tight">Walks</h1>
      <p className="text-[13px] text-[var(--text-secondary)]">
        Gaps shorter than campus walk time + 2 minutes.
      </p>

      {warnings.length === 0 ? (
        <p className="text-[13px] text-[var(--text-tertiary)]">No tight transitions.</p>
      ) : (
        <ul className="space-y-3">
          {warnings.map((w, i) => (
            <li key={i} className="border-l-2 border-[var(--warn)] pl-3">
              <p className="text-[13px] text-[var(--text)]">{w.message}</p>
              <p className="mt-1 text-[12px] tabular text-[var(--text-secondary)]">
                Gap {w.gapMin}m · Walk {w.walkMin}m · Need {w.walkMin + 2}m
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
