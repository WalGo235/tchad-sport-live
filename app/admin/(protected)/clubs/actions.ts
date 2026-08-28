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

function textOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? value : null;
}

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

async function getRole(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "";
  const { data: adminRow } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single();
  return adminRow?.role ?? "";
}

export async function upsertClub(clubId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newLogoUrl = await uploadFile(supabase, formData.get("logoFile") as File | null, "clubs");
  const newStadiumPhotoUrl = await uploadFile(supabase, formData.get("stadiumPhotoFile") as File | null, "stades");
  const newTeamPhotoUrl = await uploadFile(supabase, formData.get("teamPhotoFile") as File | null, "equipes");
  const newRegistrationUrl = await uploadFile(supabase, formData.get("registrationFile") as File | null, "documents");

  const name = formData.get("name") as string;
  const payload: Record<string, unknown> = {
    name,
    description: textOrNull(formData, "description"),
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

  let finalId = clubId;
  const role = await getRole(supabase);

  if (clubId) {
    const { data: current } = await supabase.from("teams").select("approval_status").eq("id", clubId).single();

    // Fiche déjà publique + modifiée par un gestionnaire (pas super_admin) :
    // on NE touche PAS à "teams" (les vraies infos restent visibles au public
    // pendant l'attente), on stocke la proposition à part pour validation.
    if (role !== "super_admin" && current?.approval_status === "approved") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("pending_edits").upsert(
        {
          entity_type: "club",
          entity_id: clubId,
          changes: payload,
          submitted_by: user?.id ?? null,
          submitted_by_name: user?.email ?? null,
        },
        { onConflict: "entity_type,entity_id" }
      );

      await logActivity({
        action: "Modification proposée (club)",
        entityType: "club",
        entityId: clubId,
        details: { name },
      });

      revalidatePath("/admin/validations");
      return;
    }

    const { error: updateError } = await supabase.from("teams").update(payload).eq("id", clubId);
    if (updateError) console.error("Erreur mise à jour club:", updateError.message);
  } else {
    payload.approval_status = role === "super_admin" ? "approved" : "pending";
    const { data, error: insertError } = await supabase.from("teams").insert(payload).select("id").single();
    if (insertError) console.error("Erreur création club:", insertError.message);
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: clubId ? "Modification de club" : "Ajout de club",
    entityType: "club",
    entityId: finalId ?? undefined,
    details: { name },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/admin/validations");
  revalidatePath("/competitions");
  revalidatePath("/clubs");
}

export async function deleteClub(clubId: string) {
  const supabase = await createClient();
  const role = await getRole(supabase);

  const { data: club } = await supabase.from("teams").select("name").eq("id", clubId).single();

  if (role === "super_admin") {
    await supabase.from("teams").delete().eq("id", clubId);
  } else {
    await supabase.from("teams").update({ approval_status: "pending_deletion" }).eq("id", clubId);
  }

  await logActivity({
    action: role === "super_admin" ? "Suppression de club" : "Demande de suppression de club",
    entityType: "club",
    entityId: clubId,
    details: { name: club?.name },
  });

  revalidatePath("/admin/clubs");
  revalidatePath("/admin/validations");
  revalidatePath("/clubs");
}
