"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UnitType } from "@/lib/types";

type ActionResult = { error?: string };

export async function createExercise(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const unitType = String(formData.get("unit_type") ?? "weight") as UnitType;

  if (!name) {
    return { error: "Give the exercise a name." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase.from("exercises").insert({
    owner_id: user.id,
    name,
    unit_type: unitType,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have an exercise with that name." };
    }
    return { error: error.message };
  }

  revalidatePath("/exercises");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteExercise(exerciseId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", exerciseId);
  if (error) return { error: error.message };

  revalidatePath("/exercises");
  revalidatePath("/dashboard");
  return {};
}

export async function logSet(formData: FormData): Promise<ActionResult> {
  const exerciseId = String(formData.get("exercise_id") ?? "");
  const unitType = String(formData.get("unit_type") ?? "weight") as UnitType;
  const performedAt = String(formData.get("performed_at") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!exerciseId || !performedAt) {
    return { error: "Missing required fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const record: Record<string, unknown> = {
    user_id: user.id,
    exercise_id: exerciseId,
    performed_at: performedAt,
    notes,
  };

  if (unitType === "duration") {
    const minutes = Number(formData.get("minutes") ?? 0);
    const seconds = Number(formData.get("seconds") ?? 0);
    const totalSeconds = Math.round(minutes * 60 + seconds);
    if (!totalSeconds || totalSeconds <= 0) {
      return { error: "Enter a duration greater than zero." };
    }
    record.duration_seconds = totalSeconds;
  } else {
    const isMax = formData.get("is_max") === "true";
    const weight = Number(formData.get("weight_kg"));
    if (!weight || weight <= 0) {
      return { error: "Enter a weight greater than zero." };
    }
    record.weight_kg = weight;
    record.is_max = isMax;
    if (isMax) {
      record.reps = null;
    } else {
      const reps = Number(formData.get("reps"));
      record.reps = reps > 0 ? Math.round(reps) : null;
    }
  }

  const { error } = await supabase.from("personal_records").insert(record);
  if (error) return { error: error.message };

  revalidatePath(`/exercises/${exerciseId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function deletePersonalRecord(
  recordId: string,
  exerciseId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("personal_records")
    .delete()
    .eq("id", recordId);
  if (error) return { error: error.message };

  revalidatePath(`/exercises/${exerciseId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const avatarFile = formData.get("avatar");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const update: Record<string, unknown> = {};
  if (displayName) update.display_name = displayName;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) return { error: uploadError.message };

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    update.avatar_url = publicUrl;
  }

  if (Object.keys(update).length === 0) {
    return { error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
