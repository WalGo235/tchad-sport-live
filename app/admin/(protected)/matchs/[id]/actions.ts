"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function upsertStats(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    match_id: matchId,
    possession_home: numberOrNull(formData, "possessionHome"),
    possession_away: numberOrNull(formData, "possessionAway"),
    shots_home: numberOrNull(formData, "shotsHome"),
    shots_away: numberOrNull(formData, "shotsAway"),
    shots_on_target_home: numberOrNull(formData, "shotsOnTargetHome"),
    shots_on_target_away: numberOrNull(formData, "shotsOnTargetAway"),
    corners_home: numberOrNull(formData, "cornersHome"),
    corners_away: numberOrNull(formData, "cornersAway"),
    fouls_home: numberOrNull(formData, "foulsHome"),
    fouls_away: numberOrNull(formData, "foulsAway"),
    offsides_home: numberOrNull(formData, "offsidesHome"),
    offsides_away: numberOrNull(formData, "offsidesAway"),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("match_stats").upsert(payload);
  if (error) console.error("Erreur mise à jour stats:", error.message);

  await logActivity({
    action: "Mise à jour des statistiques de match",
    entityType: "match_stats",
    entityId: matchId,
    details: {},
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function addEvent(matchId: string, formData: FormData) {
  const supabase = await createClient();

  const teamId = formData.get("teamId") as string;
  const playerId = (formData.get("playerId") as string) || null;
  const eventType = formData.get("eventType") as string;
  const minute = (formData.get("minute") as string) || null;

  const { error } = await supabase.from("match_events").insert({
    match_id: matchId,
    team_id: teamId,
    player_id: playerId,
    event_type: eventType,
    minute,
  });
  if (error) console.error("Erreur ajout événement:", error.message);

  await logActivity({
    action: "Ajout d'événement de match",
    entityType: "match_event",
    entityId: matchId,
    details: { eventType, minute },
  });

  revalidatePath(`/admin/matchs/${matchId}`);
  revalidatePath(`/matchs/${matchId}`);
}

export async function deleteEvent(matchId: string, eventId: string) {
  const supabase = await createClient();

  await supabase.from("match_events").delete().eq("id", eventId);

  await logActivity({
    action: "Suppression d'événement de match",
    entityType: "match_event",
    entityId: matchId,
    details: {},
  });

  revalidatePath(`/admin/matchs/${matchId}`);
}