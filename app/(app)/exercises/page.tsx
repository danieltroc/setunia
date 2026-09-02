import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddExerciseDialog } from "./add-exercise-dialog";
import type { Exercise } from "@/lib/types";

export default async function ExercisesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: exercises } = (await supabase
    .from("exercises")
    .select("*")
    .order("name")) as { data: Exercise[] | null };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
          <p className="text-sm text-muted-foreground">
            Common lifts plus anything you&apos;ve added yourself.
          </p>
        </div>
        <AddExerciseDialog />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(exercises ?? []).map((exercise) => (
          <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
            <Card className="transition-colors hover:border-foreground/30">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{exercise.name}</CardTitle>
                <div className="flex gap-2">
                  {exercise.unit_type === "duration" && (
                    <Badge variant="outline">Timed</Badge>
                  )}
                  {exercise.owner_id === user!.id && (
                    <Badge variant="secondary">Custom</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
