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
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value)}
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value: number) =>
              unitType === "duration" ? formatDuration(value) : String(value)
            }
            className="text-xs"
            tick={{ fontSize: 12 }}
            width={48}
          />
          <Tooltip
            formatter={(value) =>
              unitType === "duration" ? formatDuration(Number(value)) : `${value} kg`
            }
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
