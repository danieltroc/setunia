"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { deletePersonalRecord } from "../../actions";
import { formatDate, formatDuration } from "@/lib/format";
import type { PersonalRecord, UnitType } from "@/lib/types";

export function RecordHistory({
  records,
  unitType,
  exerciseId,
}: {
  records: PersonalRecord[];
  unitType: UnitType;
  exerciseId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(recordId: string) {
    startTransition(async () => {
      const result = await deletePersonalRecord(recordId, exerciseId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Entry deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">History</p>
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {records.map((record) => (
            <div key={record.id} className="flex items-center gap-3 px-5 py-4">
              <div className="flex flex-1 flex-col">
                <span className="font-semibold tabular-nums">
                  {unitType === "duration"
                    ? formatDuration(record.duration_seconds ?? 0)
                    : `${record.weight_kg} kg${record.reps ? ` × ${record.reps}` : ""}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(record.performed_at)}
                  {record.notes ? ` · ${record.notes}` : ""}
                </span>
              </div>
              <button
                type="button"
                aria-label="Delete entry"
                disabled={pending}
                onClick={() => handleDelete(record.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
