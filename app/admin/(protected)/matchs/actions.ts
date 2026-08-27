"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

function textOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? value : null;
}

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function createMatch(formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    competition_id: textOrNull(formData, "competitionId"),
    home_team_id: textOrNull(formData, "homeTeamId"),
    away_team_id: textOrNull(formData, "awayTeamId"),
    home_score: numberOrNull(formData, "homeScore") ?? 0,
    away_score: numberOrNull(formData, "awayScore") ?? 0,
    status: textOrNull(formData, "status") ?? "scheduled",
    match_date: formData.get("matchDate") as string,
    venue: textOrNull(formData, "venue"),
    minute: textOrNull(formData, "minute"),
    phase_id: textOrNull(formData, "phaseId"),
    penalty_home_score: numberOrNull(formData, "penaltyHomeScore"),
    penalty_away_score: numberOrNull(formData, "penaltyAwayScore"),
  };

  const halfDuration = numberOrNull(formData, "halfDuration");
  if (halfDuration) payload.half_duration = halfDuration;

  const { data, error } = await supabase.from("matches").insert(payload).select("id").single();
  if (error) console.error("Erreur création match:", error.message);

  await logActivity({
    action: "Ajout de match",
    entityType: "match",
    entityId: data?.id ?? undefined,
    details: { home_team_id: payload.home_team_id, away_team_id: payload.away_team_id },
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/matchs");
}

// Mise à jour PARTIELLE : ne touche que les champs réellement présents dans le
// formulaire soumis (formData.has(...)). C'est le correctif du bug trouvé :
// l'ancienne version envoyait TOUJOURS tous les champs, donc un formulaire qui
// ne renvoie pas matchDate (ex: modif rapide du score/statut) écrasait
// match_date à null -> violation de contrainte NOT NULL -> toute la mise à
// jour rejetée par Postgres (confirmé via les logs runtime Vercel).
export async function updateMatch(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};
  if (formData.has("competitionId")) payload.competition_id = textOrNull(formData, "competitionId");
  if (formData.has("homeTeamId")) payload.home_team_id = textOrNull(formData, "homeTeamId");
  if (formData.has("awayTeamId")) payload.away_team_id = textOrNull(formData, "awayTeamId");
  if (formData.has("homeScore")) payload.home_score = numberOrNull(formData, "homeScore") ?? 0;
  if (formData.has("awayScore")) payload.away_score = numberOrNull(formData, "awayScore") ?? 0;
  if (formData.has("status")) payload.status = textOrNull(formData, "status") ?? "scheduled";
  if (formData.has("matchDate")) {
    const matchDate = formData.get("matchDate") as string;
    if (matchDate) payload.match_date = matchDate; // jamais null : colonne NOT NULL
  }
  if (formData.has("venue")) payload.venue = textOrNull(formData, "venue");
  if (formData.has("minute")) payload.minute = textOrNull(formData, "minute");
  if (formData.has("phaseId")) payload.phase_id = textOrNull(formData, "phaseId");
  if (formData.has("penaltyHomeScore")) payload.penalty_home_score = numberOrNull(formData, "penaltyHomeScore");
  if (formData.has("penaltyAwayScore")) payload.penalty_away_score = numberOrNull(formData, "penaltyAwayScore");
  if (formData.has("halfDuration")) {
    const halfDuration = numberOrNull(formData, "halfDuration");
    if (halfDuration) payload.half_duration = halfDuration;
  }

  const { error } = await supabase.from("matches").update(payload).eq("id", matchId);
  if (error) console.error("Erreur mise à jour match:", error.message);

  await logActivity({
    action: "Modification de match",
    entityType: "match",
    entityId: matchId,
    details: payload,
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/matchs");
  revalidatePath(`/matchs/${matchId}`);
}

export async function deleteMatch(matchId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) console.error("Erreur suppression match:", error.message);

  await logActivity({
    action: "Suppression de match",
    entityType: "match",
    entityId: matchId,
  });

  revalidatePath("/admin/matchs");
  revalidatePath("/matchs");
}
