export type UnitType = "weight" | "duration";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  owner_id: string | null;
  name: string;
  unit_type: UnitType;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  is_max: boolean;
  performed_at: string;
  notes: string | null;
  created_at: string;
}
