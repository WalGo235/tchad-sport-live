"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertPlayer(playerId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const teamId = (formData.get("teamId") as string) || null;
  const position = (formData.get("position") as string) || null;
  const jerseyNumberRaw = formData.get("jerseyNumber") as string;
  const jerseyNumber = jerseyNumberRaw ? Number(jerseyNumberRaw) : null;
  const photoUrl = (formData.get("photoUrl") as string) || null;

  const payload = {
    name,
    team_id: teamId,
    position,
    jersey_number: jerseyNumber,
    photo_url: photoUrl,
  };

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
