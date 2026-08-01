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

export async function upsertClub(clubId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newLogoUrl = await uploadFile(supabase, formData.get("logoFile") as File | null, "clubs");
  const newStadiumPhotoUrl = await uploadFile(supabase, formData.get("stadiumPhotoFile") as File | null, "stades");
  const newTeamPhotoUrl = await uploadFile(supabase, formData.get("teamPhotoFile") as File | null, "equipes");
  const newRegistrationUrl = await uploadFile(supabase, formData.get("registrationFile") as File | null, "documents");

  const payload: Record<string, unknown> = {
    name: formData.get("name") as string,
    abbreviation: textOrNull(formData, "abbreviation"),
    founded_date: textOrNull(formData, "foundedDate"),
    city: textOrNull(formData, "city"),
    region: textOrNull(formData, "region"),
    country: textOrNull(formData, "country"),
    colors: textOrNull(formData, "colors"),
    motto: textOrNull(formData, "motto"),
    postal_address: textOrNull(formData, "postalAddress"),
    phone: textOrNull(formData, "phone"),
    email: textOrNull(formData, "email"),
    website: textOrNull(formData, "website"),
    social_links: textOrNull(formData, "socialLinks"),
    president: textOrNull(formData, "president"),
    secretary_general: textOrNull(formData, "secretaryGeneral"),
    treasurer: textOrNull(formData, "treasurer"),
    sports_director: textOrNull(formData, "sportsDirector"),
    head_coach: textOrNull(formData, "headCoach"),
    assistant_coaches: textOrNull(formData, "assistantCoaches"),
    medical_staff: textOrNull(formData, "medicalStaff"),
    stadium_name: textOrNull(formData, "stadiumName"),
    stadium_capacity: numberOrNull(formData, "stadiumCapacity"),
    stadium_address: textOrNull(formData, "stadiumAddress"),
    training_center: textOrNull(formData, "trainingCenter"),
    current_division: textOrNull(formData, "currentDivision"),
    honors: textOrNull(formData, "honors"),
    best_historical_ranking: textOrNull(formData, "bestHistoricalRanking"),
    international_competitions: textOrNull(formData, "internationalCompetitions"),
    licensed_members: numberOrNull(formData, "licensedMembers"),
    sports_sections: textOrNull(formData, "sportsSections"),
    season_goal: textOrNull(formData, "seasonGoal"),
    development_strategy: textOrNull(formData, "developmentStrategy"),
    community_engagement: textOrNull(formData, "communityEngagement"),
    sponsors: textOrNull(formData, "sponsors"),
  };

  if (newLogoUrl) payload.logo_url = newLogoUrl;
  if (newStadiumPhotoUrl) payload.stadium_photo_url = newStadiumPhotoUrl;
  if (newTeamPhotoUrl) payload.team_photo_url = newTeamPhotoUrl;
  if (newRegistrationUrl) payload.registration_doc_url = newRegistrationUrl;

  if (clubId) {
    await supabase.from("teams").update(payload).eq("id", clubId);
  } else {
    await supabase.from("teams").insert(payload);
  }

  revalidatePath("/admin/clubs");
  revalidatePath("/competitions");
}

export async function deleteClub(clubId: string) {
  const supabase = await createClient();
  await supabase.from("teams").delete().eq("id", clubId);
  revalidatePath("/admin/clubs");
}