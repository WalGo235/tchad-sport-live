"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function createMatch(formData: FormData) {
  const supabase = await createClient();

  const competitionId = formData.get("competitionId") as string;
  const homeTeamId = formData.get("homeTeamId") as string;
  const awayTeamId = formData.get("awayTeamId") as string;
  const matchDate = formData.get("matchDate") as string;
  const venue = (formData.get("venue") as string) || null;
  const status = (formData.get("status") as string) || "scheduled";
  const halfDuration = Number(formData.get("halfDuration")) || 45;

  const { data, error } = await supabase
    .from("matches")
    .insert({
      competition_id: competitionId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: matchDate,
      venue,
      status,
      half_duration: halfDuration,
      home_score: 0,
      away_score: 0,
    })
    .select("id")
    .single();

  if (error) console.error("Erreur création match:", error.message);

  await logActivity({
    action: "Ajout de match",
    entityType: "match",
    entityId: data?.id ?? undefined,
    details: { competitionId, homeTeamId, awayTeamId, matchDate, status, halfDuration },
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/");
  revalidatePath("/matchs");
}

export async function updateMatch(matchId: string, formData: FormData) {
  const supabase = await createClient();

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
    action: "Mise à jour de match",
    entityType: "match",
    entityId: matchId,
    details: { homeScore, awayScore, status, minute },
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/");
  revalidatePath("/matchs");
}

export async function deleteMatch(matchId: string) {
  const supabase = await createClient();

  await supabase.from("matches").delete().eq("id", matchId);

  await logActivity({
    action: "Suppression de match",
    entityType: "match",
    entityId: matchId,
    details: {},
  });

  revalidatePath("/admin/matchs");
}