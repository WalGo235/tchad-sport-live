"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function upsertCompetition(competitionId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const season = (formData.get("season") as string) || null;

  let finalId = competitionId;

  if (competitionId) {
    await supabase.from("competitions").update({ name, season }).eq("id", competitionId);
  } else {
    const { data } = await supabase.from("competitions").insert({ name, season }).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: competitionId ? "Modification de compétition" : "Ajout de compétition",
    entityType: "competition",
    entityId: finalId ?? undefined,
    details: { name, season },
  });

  revalidatePath("/admin/competitions");
  revalidatePath("/matchs");
  revalidatePath("/competitions");
}

export async function deleteCompetition(competitionId: string) {
  const supabase = await createClient();

  const { data: competition } = await supabase.from("competitions").select("name").eq("id", competitionId).single();

  await supabase.from("competitions").delete().eq("id", competitionId);

  await logActivity({
    action: "Suppression de compétition",
    entityType: "competition",
    entityId: competitionId,
    details: { name: competition?.name },
  });

  revalidatePath("/admin/competitions");
}