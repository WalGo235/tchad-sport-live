"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadPhoto(
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

export async function upsertPlayer(playerId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const teamId = (formData.get("teamId") as string) || null;
  const position = (formData.get("position") as string) || null;
  const jerseyNumberRaw = formData.get("jerseyNumber") as string;
  const jerseyNumber = jerseyNumberRaw ? Number(jerseyNumberRaw) : null;
  const photoFile = formData.get("photoFile") as File | null;

  const newPhotoUrl = await uploadPhoto(supabase, photoFile, "joueurs");

  const payload: Record<string, unknown> = {
    name,
    team_id: teamId,
    position,
    jersey_number: jerseyNumber,
  };
  if (newPhotoUrl) payload.photo_url = newPhotoUrl;

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