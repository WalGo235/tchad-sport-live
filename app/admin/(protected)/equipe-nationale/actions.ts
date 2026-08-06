"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function updateNationalTeamInfo(formData: FormData) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("national_team_info").select("id").limit(1).single();

  const payload = {
    overview: (formData.get("overview") as string) || null,
    nickname_origin: (formData.get("nicknameOrigin") as string) || null,
    founding_year: (formData.get("foundingYear") as string) || null,
    fifa_ranking: (formData.get("fifaRanking") as string) || null,
    colors: (formData.get("colors") as string) || null,
    federation: (formData.get("federation") as string) || null,
    formation: (formData.get("formation") as string) || null,
  };

  if (existing) {
    await supabase.from("national_team_info").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("national_team_info").insert(payload);
  }

  await logActivity({
    action: "Mise à jour des informations Équipe Nationale",
    entityType: "national_team_info",
  });

  revalidatePath("/admin/equipe-nationale");
  revalidatePath("/equipe-nationale/apercu");
  revalidatePath("/equipe-nationale/informations");
  revalidatePath("/equipe-nationale/composition");
}
