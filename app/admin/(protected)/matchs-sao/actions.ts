"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function upsertNationalMatch(matchId: string | null, formData: FormData) {
  const supabase = await createClient();

  const opponent = formData.get("opponent") as string;
  const payload = {
    opponent,
    home_away: (formData.get("homeAway") as string) || null,
    score_us: numberOrNull(formData, "scoreUs"),
    score_opponent: numberOrNull(formData, "scoreOpponent"),
    competition: (formData.get("competition") as string) || null,
    match_date: formData.get("matchDate") as string,
    venue: (formData.get("venue") as string) || null,
    status: (formData.get("status") as string) || "scheduled",
  };

  let finalId = matchId;

  if (matchId) {
    await supabase.from("national_team_matches").update(payload).eq("id", matchId);
  } else {
    const { data } = await supabase.from("national_team_matches").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: matchId ? "Modification match Sao" : "Ajout match Sao",
    entityType: "national_team_match",
    entityId: finalId ?? undefined,
    details: { opponent },
  });

  revalidatePath("/admin/matchs-sao");
  revalidatePath("/equipe-nationale/matchs-recents");
}

export async function deleteNationalMatch(matchId: string) {
  const supabase = await createClient();
  const { data: match } = await supabase.from("national_team_matches").select("opponent").eq("id", matchId).single();
  await supabase.from("national_team_matches").delete().eq("id", matchId);
  await logActivity({
    action: "Suppression match Sao",
    entityType: "national_team_match",
    entityId: matchId,
    details: { opponent: match?.opponent },
  });
  revalidatePath("/admin/matchs-sao");
}
