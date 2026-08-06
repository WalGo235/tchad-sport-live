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
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage.from("photos").upload(fileName, file);
  if (error) return null;
  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
  return data.publicUrl;
}

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function upsertNationalPlayer(playerId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newPhotoUrl = await uploadFile(supabase, formData.get("photoFile") as File | null, "sao");

  const name = formData.get("name") as string;
  const payload: Record<string, unknown> = {
    name,
    position: (formData.get("position") as string) || null,
    club: (formData.get("club") as string) || null,
    jersey_number: numberOrNull(formData, "jerseyNumber"),
    caps: numberOrNull(formData, "caps"),
    goals: numberOrNull(formData, "goals"),
    is_starter: formData.get("isStarter") === "on",
  };
  if (newPhotoUrl) payload.photo_url = newPhotoUrl;

  let finalId = playerId;

  if (playerId) {
    await supabase.from("national_team_players").update(payload).eq("id", playerId);
  } else {
    const { data } = await supabase.from("national_team_players").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: playerId ? "Modification joueur Sao" : "Ajout joueur Sao",
    entityType: "national_team_player",
    entityId: finalId ?? undefined,
    details: { name },
  });

  revalidatePath("/admin/effectif-sao");
  revalidatePath("/equipe-nationale/effectif");
  revalidatePath("/equipe-nationale/composition");
}

export async function deleteNationalPlayer(playerId: string) {
  const supabase = await createClient();
  const { data: player } = await supabase.from("national_team_players").select("name").eq("id", playerId).single();
  await supabase.from("national_team_players").delete().eq("id", playerId);
  await logActivity({
    action: "Suppression joueur Sao",
    entityType: "national_team_player",
    entityId: playerId,
    details: { name: player?.name },
  });
  revalidatePath("/admin/effectif-sao");
}
