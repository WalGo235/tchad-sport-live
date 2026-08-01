"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage.from("photos").upload(fileName, file);
  if (error) return null;
  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
  return data.publicUrl;
}

function textOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? value : null;
}

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function upsertPlayer(playerId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newPhotoUrl = await uploadFile(supabase, formData.get("photoFile") as File | null, "joueurs");
  const newLicenseUrl = await uploadFile(supabase, formData.get("licenseFile") as File | null, "licences");

  const payload: Record<string, unknown> = {
    name: formData.get("name") as string,
    team_id: textOrNull(formData, "teamId"),
    position: textOrNull(formData, "position"),
    jersey_number: numberOrNull(formData, "jerseyNumber"),
    date_of_birth: textOrNull(formData, "dateOfBirth"),
    birth_place: textOrNull(formData, "birthPlace"),
    nationality: textOrNull(formData, "nationality"),
    height_cm: numberOrNull(formData, "heightCm"),
    weight_kg: numberOrNull(formData, "weightKg"),
    other_positions: textOrNull(formData, "otherPositions"),
    preferred_foot: textOrNull(formData, "preferredFoot"),
    address: textOrNull(formData, "address"),
    phone: textOrNull(formData, "phone"),
    email: textOrNull(formData, "email"),
    social_links: textOrNull(formData, "socialLinks"),
    joined_year: numberOrNull(formData, "joinedYear"),
    previous_clubs: textOrNull(formData, "previousClubs"),
    level: textOrNull(formData, "level"),
    major_competitions: textOrNull(formData, "majorCompetitions"),
    national_selections: textOrNull(formData, "nationalSelections"),
    matches_played: numberOrNull(formData, "matchesPlayed"),
    goals: numberOrNull(formData, "goals"),
    assists: numberOrNull(formData, "assists"),
    yellow_cards: numberOrNull(formData, "yellowCards"),
    red_cards: numberOrNull(formData, "redCards"),
    minutes_played: numberOrNull(formData, "minutesPlayed"),
    rating_speed: numberOrNull(formData, "ratingSpeed"),
    rating_stamina: numberOrNull(formData, "ratingStamina"),
    rating_technique: numberOrNull(formData, "ratingTechnique"),
    rating_vision: numberOrNull(formData, "ratingVision"),
    rating_shooting: numberOrNull(formData, "ratingShooting"),
    rating_defense: numberOrNull(formData, "ratingDefense"),
    rating_dribbling: numberOrNull(formData, "ratingDribbling"),
    rating_aerial: numberOrNull(formData, "ratingAerial"),
    dream: textOrNull(formData, "dream"),
    inspiration: textOrNull(formData, "inspiration"),
    season_goal: textOrNull(formData, "seasonGoal"),
    highlight_video_url: textOrNull(formData, "highlightVideoUrl"),
  };

  if (newPhotoUrl) payload.photo_url = newPhotoUrl;
  if (newLicenseUrl) payload.license_doc_url = newLicenseUrl;

  if (playerId) {
    await supabase.from("players").update(payload).eq("id", playerId);
  } else {
    await supabase.from("players").insert(payload);
  }

  revalidatePath("/admin/joueurs");
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient();
  await supabase.from("players").delete().eq("id", playerId);
  revalidatePath("/admin/joueurs");
}