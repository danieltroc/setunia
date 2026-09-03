"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { deletePersonalRecord } from "../../actions";
import { formatDate, formatDuration } from "@/lib/format";
import type { PersonalRecord, UnitType } from "@/lib/types";

function groupByDate(records: PersonalRecord[]) {
  const groups = new Map<string, PersonalRecord[]>();
  for (const record of records) {
    const existing = groups.get(record.performed_at);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(record.performed_at, [record]);
    }
  }
  return [...groups.entries()].map(([date, dayRecords]) => ({
    date,
    totalKg: dayRecords.reduce(
      (sum, r) => sum + (r.weight_kg ?? 0) * (r.reps ?? 0),
      0,
    ),
    records: dayRecords,
  }));
}

export function RecordHistory({
  records,
  unitType,
  exerciseId,
  mode,
}: {
  records: PersonalRecord[];
  unitType: UnitType;
  exerciseId: string;
  mode?: "max" | "reps";
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

  const DeleteButton = ({ recordId }: { recordId: string }) => (
    <button
      type="button"
      aria-label="Delete entry"
      disabled={pending}
      onClick={() => handleDelete(recordId)}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
    >
      <X className="h-4 w-4" />
    </button>
  );

  if (records.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">History</p>
        <p className="text-sm text-muted-foreground">No entries yet.</p>
      </div>
    );
  }

  if (mode === "reps") {
    const groups = groupByDate(records);
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">History</p>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.date}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDate(group.date)}
                </span>
                <span className="text-xs font-medium text-primary">
                  {group.totalKg} kg lifted that day
                </span>
              </div>
              <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {group.records.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="flex flex-1 flex-col">
                      <span className="font-semibold tabular-nums">
                        {record.weight_kg} kg × {record.reps}
                      </span>
                      {record.notes && (
                        <span className="text-xs text-muted-foreground">{record.notes}</span>
                      )}
                    </div>
                    <DeleteButton recordId={record.id} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">History</p>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
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
            <DeleteButton recordId={record.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
