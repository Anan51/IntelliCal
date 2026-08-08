import type { WalkWarning } from "@/lib/walkTimes";

type Props = {
  warnings: WalkWarning[];
};

export default function WalkAlerts({ warnings }: Props) {
  return (
    <div>
      <div className="section-card">
        <h2>Tight walk transitions</h2>
        <p className="subtitle">
          Flags back-to-back classes where the gap is shorter than UCLA walk time + 2 min buffer (Boelter ↔ Bunche = 12 min).
        </p>
        {warnings.length === 0 ? (
          <p className="empty-state">No tight walks in your current schedule. Nice!</p>
        ) : (
          <ul className="walk-list">
            {warnings.map((w, i) => (
              <li key={i} className="walk-card">
                <h3>⚠ Tight transition</h3>
                <p>{w.message}</p>
                <div className="stats">
                  <span className="walk-stat">
                    Gap: <strong>{w.gapMin} min</strong>
                  </span>
                  <span className="walk-stat">
                    Walk: <strong>{w.walkMin} min</strong>
                  </span>
                  <span className="walk-stat">
                    Need: <strong>{w.walkMin + 2} min</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
