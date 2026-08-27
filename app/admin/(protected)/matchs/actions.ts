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

function buildMatchPayload(formData: FormData): Record<string, unknown> {
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
    // ⚠️ assigned_reporter_id volontairement absent : l'assignation reporter a sa
    // propre logique (conflit horaire < 3h) — probablement une action à part,
    // non listée dans l'erreur de build, donc non touchée par ce bug.
  };

  // half_duration est NOT NULL en base (défaut 45) : on ne l'inclut que si fourni,
  // pour ne jamais écraser avec null.
  const halfDuration = numberOrNull(formData, "halfDuration");
  if (halfDuration) payload.half_duration = halfDuration;

  return payload;
}

export async function createMatch(formData: FormData) {
  const supabase = await createClient();
  const payload = buildMatchPayload(formData);

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

// ⚠️ À vérifier : j'ai supposé updateMatch(matchId, formData) dans cet ordre,
// par cohérence avec deleteMatch. Je n'ai pas vu page.tsx pour confirmer
// exactement comment ces fonctions sont appelées.
export async function updateMatch(matchId: string, formData: FormData) {
  const supabase = await createClient();
  const payload = buildMatchPayload(formData);

  const { error } = await supabase.from("matches").update(payload).eq("id", matchId);
  if (error) console.error("Erreur mise à jour match:", error.message);

  await logActivity({
    action: "Modification de match",
    entityType: "match",
    entityId: matchId,
    details: { home_team_id: payload.home_team_id, away_team_id: payload.away_team_id },
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
