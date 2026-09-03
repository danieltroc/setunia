"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PersonalRecord } from "@/lib/types";
import { LogSetForm } from "./log-set-form";
import { ProgressChart } from "./progress-chart";
import { RecordHistory } from "./record-history";

export function ExerciseTabs({
  exerciseId,
  maxRecords,
  repsRecords,
}: {
  exerciseId: string;
  maxRecords: PersonalRecord[];
  repsRecords: PersonalRecord[];
}) {
  return (
    <Tabs defaultValue="max" className="gap-6">
      <TabsList className="w-full">
        <TabsTrigger value="max">Max</TabsTrigger>
        <TabsTrigger value="reps">Reps</TabsTrigger>
      </TabsList>

      <TabsContent value="max" className="flex flex-col gap-6">
        <LogSetForm exerciseId={exerciseId} unitType="weight" mode="max" />
        {maxRecords.length > 1 && (
          <ProgressChart records={maxRecords} unitType="weight" />
        )}
        <RecordHistory
          records={maxRecords}
          unitType="weight"
          exerciseId={exerciseId}
          mode="max"
        />
      </TabsContent>

      <TabsContent value="reps" className="flex flex-col gap-6">
        <LogSetForm exerciseId={exerciseId} unitType="weight" mode="reps" />
        <RecordHistory
          records={repsRecords}
          unitType="weight"
          exerciseId={exerciseId}
          mode="reps"
        />
      </TabsContent>
    </Tabs>
  );
}
