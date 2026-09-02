"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePersonalRecord } from "../../actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>{unitType === "duration" ? "Duration" : "Weight × Reps"}</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{formatDate(record.performed_at)}</TableCell>
            <TableCell>
              {unitType === "duration"
                ? formatDuration(record.duration_seconds ?? 0)
                : `${record.weight_kg} kg${record.reps ? ` × ${record.reps}` : ""}`}
            </TableCell>
            <TableCell className="text-muted-foreground">{record.notes ?? ""}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
