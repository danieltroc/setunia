"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { logSet } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UnitType } from "@/lib/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function LogSetForm({
  exerciseId,
  unitType,
}: {
  exerciseId: string;
  unitType: UnitType;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await logSet(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Set logged");
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5"
    >
      <p className="text-sm font-semibold">Log a set</p>
      <input type="hidden" name="exercise_id" value={exerciseId} />
      <input type="hidden" name="unit_type" value={unitType} />

      {unitType === "duration" ? (
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="minutes">Minutes</Label>
            <Input
              id="minutes"
              name="minutes"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
              className="rounded-2xl"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="seconds">Seconds</Label>
            <Input
              id="seconds"
              name="seconds"
              type="number"
              min={0}
              max={59}
              step={1}
              defaultValue={0}
              className="rounded-2xl"
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              name="weight_kg"
              type="number"
              min={0}
              step={0.5}
              required
              className="rounded-2xl"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              name="reps"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 8"
              className="rounded-2xl"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="performed_at">Date</Label>
        <Input
          id="performed_at"
          name="performed_at"
          type="date"
          defaultValue={today()}
          required
          className="rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Optional" rows={2} className="rounded-2xl" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-1 h-11 rounded-2xl text-base">
        {pending ? "Logging…" : "Log set"}
      </Button>
    </form>
  );
}
