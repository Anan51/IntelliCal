"use client";

import SyllabusIntake from "./SyllabusIntake";
import { Button } from "./ui";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SyllabusModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="syllabus-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <div>
            <p className="kicker">Setup</p>
            <h2 id="syllabus-modal-title">Import syllabus</h2>
            <p className="subtitle">
              One-time intake. Review parsed events, then commit them to your calendar.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close import">
            Close
          </Button>
        </div>
        <SyllabusIntake embedded onCommitted={onClose} />
      </div>
    </div>
  );
}
