"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

const CONFLICT_WINDOW_HOURS = 3;

async function checkReporterConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reporterId: string,
  matchDate: string,
  excludeMatchId: string | null
): Promise<string | null> {
  const kickoff = new Date(matchDate).getTime();
  const windowMs = CONFLICT_WINDOW_HOURS * 60 * 60 * 1000;

  let query = supabase
    .from("matches")
    .select("id, match_date, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
    .eq("assigned_reporter_id", reporterId);

  if (excludeMatchId) {
    query = query.neq("id", excludeMatchId);
  }

  const { data: existing } = await query;

  for (const m of existing ?? []) {
    const otherKickoff = new Date(m.match_date).getTime();
    if (Math.abs(otherKickoff - kickoff) < windowMs) {
      const home = (m.home_team as unknown as { name: string } | null)?.name ?? "?";
      const away = (m.away_team as unknown as { name: string } | null)?.name ?? "?";
      return `Ce reporter est déjà assigné à ${home} vs ${away} à moins de ${CONFLICT_WINDOW_HOURS}h de ce match.`;
    }
  }

  return null;
}

export async function createMatch(formData: FormData) {
  const supabase = await createClient();

  const competitionId = formData.get("competitionId") as string;
  const homeTeamId = formData.get("homeTeamId") as string;
  const awayTeamId = formData.get("awayTeamId") as string;
  const matchDate = formData.get("matchDate") as string;
  const venue = (formData.get("venue") as string) || null;
  const status = (formData.get("status") as string) || "scheduled";
  const halfDuration = Number(formData.get("halfDuration")) || 45;
  const assignedReporterId = (formData.get("assignedReporterId") as string) || null;

  if (assignedReporterId) {
    const conflict = await checkReporterConflict(supabase, assignedReporterId, matchDate, null);
    if (conflict) {
      console.error("Conflit reporter:", conflict);
      return;
    }
  }

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
      assigned_reporter_id: assignedReporterId,
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
    details: { competitionId, homeTeamId, awayTeamId, matchDate, status, halfDuration, assignedReporterId },
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
  const penaltyHomeRaw = formData.get("penaltyHomeScore") as string;
  const penaltyAwayRaw = formData.get("penaltyAwayScore") as string;
  const assignedReporterId = (formData.get("assignedReporterId") as string) || null;

  if (assignedReporterId) {
    const { data: match } = await supabase.from("matches").select("match_date").eq("id", matchId).single();
    if (match) {
      const conflict = await checkReporterConflict(supabase, assignedReporterId, match.match_date, matchId);
      if (conflict) {
        console.error("Conflit reporter:", conflict);
        return;
      }
    }
  }

  const { error } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status,
      minute,
      penalty_home_score: penaltyHomeRaw ? Number(penaltyHomeRaw) : null,
      penalty_away_score: penaltyAwayRaw ? Number(penaltyAwayRaw) : null,
      assigned_reporter_id: assignedReporterId,
    })
    .eq("id", matchId);

  if (error) console.error("Erreur mise à jour match:", error.message);

  await logActivity({
    action: "Mise à jour de match",
    entityType: "match",
    entityId: matchId,
    details: { homeScore, awayScore, status, minute, assignedReporterId },
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