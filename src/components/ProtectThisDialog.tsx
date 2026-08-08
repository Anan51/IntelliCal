"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  dayISO: string | null;
  hour: number | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function formatHour(h: number): string {
  if (h === 12) return "12 PM";
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

function formatDay(dayISO: string): string {
  const d = new Date(`${dayISO}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function ProtectThisDialog({
  open,
  dayISO,
  hour,
  onOpenChange,
  onConfirm,
}: Props) {
  const label =
    dayISO != null && hour != null
      ? `${formatDay(dayISO)}, ${formatHour(hour)} – ${formatHour(hour + 1)}`
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[var(--surface)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Protect this time?</DialogTitle>
          <DialogDescription>
            Creates a soft preference so Balanced overlap treats it as busy. You can harden or
            edit it later in Preferences.
          </DialogDescription>
        </DialogHeader>
        {label && (
          <p className="rounded-lg border border-border bg-[var(--surface-2)] px-3 py-2 text-sm font-medium">
            {label}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Protect this</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
