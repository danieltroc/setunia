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
  mode,
}: {
  exerciseId: string;
  unitType: UnitType;
  /** Only meaningful for weight exercises: "max" hides reps and logs a 1-rep max attempt. */
  mode?: "max" | "reps";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isMax = mode === "max";
  const idPrefix = mode ? `${mode}-` : "";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await logSet(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(isMax ? "Max logged" : "Set logged");
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5"
    >
      <p className="text-sm font-semibold">
        {isMax ? "Log a max attempt" : "Log a set"}
      </p>
      <input type="hidden" name="exercise_id" value={exerciseId} />
      <input type="hidden" name="unit_type" value={unitType} />
      {mode && <input type="hidden" name="is_max" value={isMax ? "true" : "false"} />}

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
            <Label htmlFor={`${idPrefix}weight_kg`}>Weight (kg)</Label>
            <Input
              id={`${idPrefix}weight_kg`}
              name="weight_kg"
              type="number"
              min={0}
              step={0.5}
              required
              className="rounded-2xl"
            />
          </div>
          {!isMax && (
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor={`${idPrefix}reps`}>Reps</Label>
              <Input
                id={`${idPrefix}reps`}
                name="reps"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 8"
                required
                className="rounded-2xl"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}performed_at`}>Date</Label>
        <Input
          id={`${idPrefix}performed_at`}
          name="performed_at"
          type="date"
          defaultValue={today()}
          required
          className="rounded-2xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}notes`}>Notes</Label>
        <Textarea
          id={`${idPrefix}notes`}
          name="notes"
          placeholder="Optional"
          rows={2}
          className="rounded-2xl"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-1 h-11 rounded-2xl text-base">
        {pending ? "Logging…" : isMax ? "Log max" : "Log set"}
      </Button>
    </form>
  );
}
