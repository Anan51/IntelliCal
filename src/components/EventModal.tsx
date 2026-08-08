"use client";

import type { CalEvent, EventKind } from "@/lib/types";
import { EVENT_KINDS } from "@/lib/types";
import { resolveLocation } from "@/lib/resolveLocation";
import { Button } from "./ui";

type Props = {
  event: CalEvent;
  onClose: () => void;
  onSave: (event: CalEvent) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
};

export default function EventModal({ event, onClose, onSave, onDelete, onPin }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="event-modal-title">Edit event</h2>
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const locRaw = String(fd.get("location") ?? "");
            onSave({
              ...event,
              title: String(fd.get("title") ?? event.title),
              kind: String(fd.get("kind") ?? event.kind) as EventKind,
              start: String(fd.get("start") ?? event.start),
              end: String(fd.get("end") ?? event.end),
              location: locRaw ? resolveLocation(locRaw) : undefined,
              source: event.source === "arranged" ? "manual" : event.source,
              updatedAt: new Date().toISOString(),
            });
          }}
        >
          <label>
            Title
            <input name="title" defaultValue={event.title} required />
          </label>
          <label>
            Kind
            <select name="kind" defaultValue={event.kind}>
              {EVENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start
            <input name="start" defaultValue={event.start} required />
          </label>
          <label>
            End
            <input name="end" defaultValue={event.end} required />
          </label>
          <label className="span-2">
            Location
            <input name="location" defaultValue={event.location?.raw ?? ""} />
          </label>
          <div className="modal-actions span-2">
            <Button type="submit">Save</Button>
            {event.kind === "preference" && event.source !== "manual" ? (
              <Button type="button" variant="secondary" onClick={() => onPin(event.id)}>
                Pin
              </Button>
            ) : null}
            <Button type="button" variant="danger" onClick={() => onDelete(event.id)}>
              Delete
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
