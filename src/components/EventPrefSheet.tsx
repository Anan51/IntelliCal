"use client";

import type { Preference, Strength } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  preference: Preference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (pref: Preference) => void;
  onDelete: (id: string) => void;
};

export default function EventPrefSheet({
  preference,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: Props) {
  if (!preference) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="border-[var(--hairline)] bg-[var(--surface)] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{preference.label}</SheetTitle>
          <SheetDescription>
            Edit strength or remove this preference. Changes update Friend Overlap live.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          <div className="flex items-center justify-between rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] px-3 py-3">
            <div>
              <Label htmlFor="sheet-hard" className="text-[13px]">
                Hard block
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Off = soft (Balanced only). On = always busy.
              </p>
            </div>
            <Switch
              id="sheet-hard"
              checked={preference.strength === "hard"}
              onCheckedChange={(hard) => {
                const strength: Strength = hard ? "hard" : "soft";
                onUpdate({ ...preference, strength });
              }}
            />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Category: <span className="text-foreground">{preference.category}</span>
            {preference.locationText ? ` · ${preference.locationText}` : ""}
          </p>
        </div>

        <SheetFooter className="mt-8 gap-2 sm:flex-col">
          <Button
            variant="outline"
            onClick={() => {
              onDelete(preference.id);
              onOpenChange(false);
            }}
            className="text-destructive"
          >
            Delete preference
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
