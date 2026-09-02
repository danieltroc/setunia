"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatDuration } from "@/lib/format";
import type { PersonalRecord, UnitType } from "@/lib/types";

export function ProgressChart({
  records,
  unitType,
}: {
  records: PersonalRecord[];
  unitType: UnitType;
}) {
  const data = [...records]
    .sort((a, b) => a.performed_at.localeCompare(b.performed_at))
    .map((record) => ({
      date: record.performed_at,
      value: unitType === "duration" ? record.duration_seconds ?? 0 : record.weight_kg ?? 0,
    }));

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="mb-2 text-sm font-semibold">Progress</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatDate(value)}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) =>
                unitType === "duration" ? formatDuration(value) : String(value)
              }
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--popover-foreground)",
                fontSize: "0.8rem",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value) =>
                unitType === "duration" ? formatDuration(Number(value)) : `${value} kg`
              }
              labelFormatter={(label) => formatDate(String(label))}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
