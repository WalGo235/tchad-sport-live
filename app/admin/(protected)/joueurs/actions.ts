"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, file);
  if (uploadError) {
    console.error("Erreur upload storage:", uploadError.message);
    return null;
  }

  return `https://iqsrxyuazktyiyhpbzie.supabase.co/storage/v1/object/public/photos/${fileName}`;
}

export async function upsertPlayer(playerId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newPhotoUrl = await uploadFile(supabase, formData.get("photoFile") as File | null, "joueurs");
  const newLicenseUrl = await uploadFile(supabase, formData.get("licenseFile") as File | null, "licences");

  const name = formData.get("name") as string;
  const payload: Record<string, unknown> = {
    name,
    team_id: (formData.get("teamId") as string) || null,
    position: (formData.get("position") as string) || null,
    jersey_number: formData.get("jerseyNumber") ? Number(formData.get("jerseyNumber")) : null,
    date_of_birth: (formData.get("dateOfBirth") as string) || null,
    birth_place: (formData.get("birthPlace") as string) || null,
    nationality: (formData.get("nationality") as string) || null,
    height_cm: formData.get("heightCm") ? Number(formData.get("heightCm")) : null,
    weight_kg: formData.get("weightKg") ? Number(formData.get("weightKg")) : null,
    other_positions: (formData.get("otherPositions") as string) || null,
    preferred_foot: (formData.get("preferredFoot") as string) || null,
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    social_links: (formData.get("socialLinks") as string) || null,
    joined_year: formData.get("joinedYear") ? Number(formData.get("joinedYear")) : null,
    previous_clubs: (formData.get("previousClubs") as string) || null,
    level: (formData.get("level") as string) || null,
    major_competitions: (formData.get("majorCompetitions") as string) || null,
    national_selections: (formData.get("nationalSelections") as string) || null,
    matches_played: formData.get("matchesPlayed") ? Number(formData.get("matchesPlayed")) : null,
    goals: formData.get("goals") ? Number(formData.get("goals")) : null,
    assists: formData.get("assists") ? Number(formData.get("assists")) : null,
    yellow_cards: formData.get("yellowCards") ? Number(formData.get("yellowCards")) : null,
    red_cards: formData.get("redCards") ? Number(formData.get("redCards")) : null,
    minutes_played: formData.get("minutesPlayed") ? Number(formData.get("minutesPlayed")) : null,
    rating_speed: formData.get("ratingSpeed") ? Number(formData.get("ratingSpeed")) : null,
    rating_stamina: formData.get("ratingStamina") ? Number(formData.get("ratingStamina")) : null,
    rating_technique: formData.get("ratingTechnique") ? Number(formData.get("ratingTechnique")) : null,
    rating_vision: formData.get("ratingVision") ? Number(formData.get("ratingVision")) : null,
    rating_shooting: formData.get("ratingShooting") ? Number(formData.get("ratingShooting")) : null,
    rating_defense: formData.get("ratingDefense") ? Number(formData.get("ratingDefense")) : null,
    rating_dribbling: formData.get("ratingDribbling") ? Number(formData.get("ratingDribbling")) : null,
    rating_aerial: formData.get("ratingAerial") ? Number(formData.get("ratingAerial")) : null,
    dream: (formData.get("dream") as string) || null,
    inspiration: (formData.get("inspiration") as string) || null,
    season_goal: (formData.get("seasonGoal") as string) || null,
    highlight_video_url: (formData.get("highlightVideoUrl") as string) || null,
  };

  if (newPhotoUrl) payload.photo_url = newPhotoUrl;
  if (newLicenseUrl) payload.license_doc_url = newLicenseUrl;

  let finalId = playerId;

  if (playerId) {
    const { error: updateError } = await supabase.from("players").update(payload).eq("id", playerId);
    if (updateError) console.error("Erreur mise à jour joueur:", updateError.message);
  } else {
    const { data, error: insertError } = await supabase.from("players").insert(payload).select("id").single();
    if (insertError) console.error("Erreur création joueur:", insertError.message);
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: playerId ? "Modification de joueur" : "Ajout de joueur",
    entityType: "player",
    entityId: finalId ?? undefined,
    details: { name },
  });

  revalidatePath("/admin/joueurs");
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient();
  const { data: player } = await supabase.from("players").select("name").eq("id", playerId).single();
  await supabase.from("players").delete().eq("id", playerId);
  await logActivity({
    action: "Suppression de joueur",
    entityType: "player",
    entityId: playerId,
    details: { name: player?.name },
  });
  revalidatePath("/admin/joueurs");
}