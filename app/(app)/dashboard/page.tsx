import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDuration } from "@/lib/format";
import type { Exercise, PersonalRecord } from "@/lib/types";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: exercises }, { data: bests }] = await Promise.all([
    supabase.from("exercises").select("*").order("name") as unknown as Promise<{
      data: Exercise[] | null;
    }>,
    supabase
      .from("personal_bests")
      .select("*")
      .eq("user_id", user!.id) as unknown as Promise<{ data: PersonalRecord[] | null }>,
  ]);

  const bestByExercise = new Map((bests ?? []).map((r) => [r.exercise_id, r]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your lifts</h1>
        <Link
          href="/exercises"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {!exercises || exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Head to{" "}
          <Link href="/exercises" className="text-foreground underline underline-offset-4">
            Exercises
          </Link>{" "}
          to add one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises.map((exercise) => {
            const best = bestByExercise.get(exercise.id);
            return (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="rounded-lg border border-border bg-card px-5 py-4 transition-colors active:bg-secondary"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {exercise.name}
                  </p>
                  {exercise.owner_id === user!.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                {best ? (
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-4xl font-bold tracking-tight tabular-nums">
                      {exercise.unit_type === "duration"
                        ? formatDuration(best.duration_seconds ?? 0)
                        : best.weight_kg}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.unit_type === "duration"
                        ? ""
                        : `kg${best.reps ? ` × ${best.reps}` : ""}`}
                    </p>
                    <p className="ml-auto text-xs text-muted-foreground">
                      {formatDate(best.performed_at)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-2xl font-bold tracking-tight text-muted-foreground/50">
                    Log a set
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
