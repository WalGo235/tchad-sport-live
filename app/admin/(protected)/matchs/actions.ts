"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function updateMatch(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const homeScore = Number(formData.get("homeScore"));
  const awayScore = Number(formData.get("awayScore"));
  const status = formData.get("status") as string;
  const minute = (formData.get("minute") as string) || null;

  await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, status, minute })
    .eq("id", matchId);

  await logActivity({
    action: "Mise à jour de match",
    entityType: "match",
    entityId: matchId,
    details: { homeScore, awayScore, status, minute },
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/");
  revalidatePath("/matchs");
}