import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/format";
import type { Exercise, PersonalRecord } from "@/lib/types";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your exercises</h1>
          <p className="text-sm text-muted-foreground">
            Your current personal best for each exercise, at a glance.
          </p>
        </div>
        <Button render={<Link href="/exercises" />}>Browse exercises</Button>
      </div>

      {!exercises || exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Head to{" "}
          <Link href="/exercises" className="underline underline-offset-4">
            Exercises
          </Link>{" "}
          to add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {exercises.map((exercise) => {
            const best = bestByExercise.get(exercise.id);
            return (
              <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                <Card className="h-full transition-colors hover:border-foreground/30">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{exercise.name}</CardTitle>
                      {exercise.owner_id === user!.id && (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {best ? (
                      <div>
                        <p className="text-xl font-semibold">
                          {exercise.unit_type === "duration"
                            ? formatDuration(best.duration_seconds ?? 0)
                            : `${best.weight_kg} kg${best.reps ? ` × ${best.reps}` : ""}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          on {formatDate(best.performed_at)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No PB yet — log a set</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
