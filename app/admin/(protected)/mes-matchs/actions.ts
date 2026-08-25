"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function updateMyMatch(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: match } = await supabase
    .from("matches")
    .select("assigned_reporter_id")
    .eq("id", matchId)
    .single();

  if (!match || match.assigned_reporter_id !== user.id) {
    console.error("Tentative de modification d'un match non assigné");
    return;
  }

  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));
  const status = formData.get("status") as string;
  const minute = (formData.get("minute") as string) || null;

  const { error } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, status, minute })
    .eq("id", matchId);

  if (error) console.error("Erreur mise à jour match:", error.message);

  await logActivity({
    action: "Mise à jour de match (reporter)",
    entityType: "match",
    entityId: matchId,
    details: { homeScore, awayScore, status, minute },
  });

  revalidatePath("/admin/mes-matchs");
  revalidatePath("/");
  revalidatePath("/matchs");
}
