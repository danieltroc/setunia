import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDuration } from "@/lib/format";
import type { Exercise, PersonalRecord } from "@/lib/types";
import { ExerciseTabs } from "./exercise-tabs";
import { LogSetForm } from "./log-set-form";
import { ProgressChart } from "./progress-chart";
import { RecordHistory } from "./record-history";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: exercise } = (await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single()) as { data: Exercise | null };

  if (!exercise) notFound();

  const { data: records } = (await supabase
    .from("personal_records")
    .select("*")
    .eq("exercise_id", id)
    .order("performed_at", { ascending: false })) as { data: PersonalRecord[] | null };

  const history = records ?? [];
  const isDuration = exercise.unit_type === "duration";
  const bestPool = isDuration ? history : history.filter((r) => r.is_max);
  const best = bestPool.reduce<PersonalRecord | null>((acc, record) => {
    if (!acc) return record;
    const accValue = isDuration ? acc.duration_seconds ?? 0 : acc.weight_kg ?? 0;
    const recordValue = isDuration ? record.duration_seconds ?? 0 : record.weight_kg ?? 0;
    return recordValue > accValue ? record : acc;
  }, null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>
        {exercise.owner_id === user!.id && (
          <span className="text-sm text-primary">Custom exercise</span>
        )}
      </div>

      <div className="rounded-lg border border-border bg-gradient-to-b from-primary/10 to-card px-6 py-8 text-center">
        {best ? (
          <>
            <p className="text-6xl font-bold tracking-tight tabular-nums">
              {isDuration ? formatDuration(best.duration_seconds ?? 0) : best.weight_kg}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDuration ? "personal best" : "kg · personal best"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              on {formatDate(best.performed_at)}
            </p>
          </>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            No sets logged yet — log your first one below.
          </p>
        )}
      </div>

      {isDuration ? (
        <>
          <LogSetForm exerciseId={exercise.id} unitType={exercise.unit_type} />
          {history.length > 1 && (
            <ProgressChart records={history} unitType={exercise.unit_type} />
          )}
          <RecordHistory records={history} unitType={exercise.unit_type} exerciseId={exercise.id} />
        </>
      ) : (
        <ExerciseTabs
          exerciseId={exercise.id}
          maxRecords={history.filter((r) => r.is_max)}
          repsRecords={history.filter((r) => !r.is_max)}
        />
      )}
    </div>
  );
}
