import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/format";
import type { Exercise, PersonalRecord } from "@/lib/types";
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
  const best = history.reduce<PersonalRecord | null>((acc, record) => {
    if (!acc) return record;
    const accValue =
      exercise.unit_type === "duration" ? acc.duration_seconds ?? 0 : acc.weight_kg ?? 0;
    const recordValue =
      exercise.unit_type === "duration"
        ? record.duration_seconds ?? 0
        : record.weight_kg ?? 0;
    return recordValue > accValue ? record : acc;
  }, null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{exercise.name}</h1>
        {exercise.owner_id === user!.id && <Badge variant="secondary">Custom</Badge>}
        {exercise.unit_type === "duration" && <Badge variant="outline">Timed</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Personal best
          </CardTitle>
        </CardHeader>
        <CardContent>
          {best ? (
            <div>
              <p className="text-3xl font-bold">
                {exercise.unit_type === "duration"
                  ? formatDuration(best.duration_seconds ?? 0)
                  : `${best.weight_kg} kg${best.reps ? ` × ${best.reps}` : ""}`}
              </p>
              <p className="text-sm text-muted-foreground">
                on {formatDate(best.performed_at)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No sets logged yet — log your first one below.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log a set</CardTitle>
        </CardHeader>
        <CardContent>
          <LogSetForm exerciseId={exercise.id} unitType={exercise.unit_type} />
        </CardContent>
      </Card>

      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart records={history} unitType={exercise.unit_type} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordHistory
            records={history}
            unitType={exercise.unit_type}
            exerciseId={exercise.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
