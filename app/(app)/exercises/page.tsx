import Link from "next/link";
import { ChevronRight, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
        <AddExerciseDialog />
      </div>

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {(exercises ?? []).map((exercise) => (
          <Link
            key={exercise.id}
            href={`/exercises/${exercise.id}`}
            className="flex items-center gap-3 px-5 py-4 transition-colors active:bg-secondary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {exercise.unit_type === "duration" ? (
                <Timer className="h-4 w-4 text-muted-foreground" />
              ) : (
                exercise.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-medium">{exercise.name}</span>
              {exercise.owner_id === user!.id && (
                <span className="text-xs text-primary">Custom</span>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
