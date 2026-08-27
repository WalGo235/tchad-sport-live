import { createClient } from "./supabase/server";

export interface MatchStatsData {
  possessionHome: number | null;
  possessionAway: number | null;
  shotsHome: number | null;
  shotsAway: number | null;
  shotsOnTargetHome: number | null;
  shotsOnTargetAway: number | null;
  cornersHome: number | null;
  cornersAway: number | null;
  foulsHome: number | null;
  foulsAway: number | null;
  offsidesHome: number | null;
  offsidesAway: number | null;
}

export async function getMatchStats(matchId: string): Promise<MatchStatsData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_stats").select("*").eq("match_id", matchId).maybeSingle();
  if (error || !data) return null;
  return {
    possessionHome: data.possession_home,
    possessionAway: data.possession_away,
    shotsHome: data.shots_home,
    shotsAway: data.shots_away,
    shotsOnTargetHome: data.shots_on_target_home,
    shotsOnTargetAway: data.shots_on_target_away,
    cornersHome: data.corners_home,
    cornersAway: data.corners_away,
    foulsHome: data.fouls_home,
    foulsAway: data.fouls_away,
    offsidesHome: data.offsides_home,
    offsidesAway: data.offsides_away,
  };
}

export interface MatchEventData {
  id: string;
  eventType: string;
  minute: string | null;
  teamId: string;
  playerName: string | null;
  substitutedPlayerName: string | null;
}

export async function getMatchEvents(matchId: string): Promise<MatchEventData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_events")
    .select(
      "id, event_type, minute, team_id, player:players!player_id(name), substituted_player:players!substituted_player_id(name)"
    )
    .eq("match_id", matchId)
    .order("minute");
  if (error || !data) return [];
  return data.map((e) => ({
    id: e.id,
    eventType: e.event_type ?? "",
    minute: e.minute,
    teamId: e.team_id,
    playerName: (e.player as unknown as { name: string } | null)?.name ?? null,
    substitutedPlayerName: (e.substituted_player as unknown as { name: string } | null)?.name ?? null,
  }));
}

export interface MatchLineupPlayer {
  playerId: string;
  name: string;
  isStarter: boolean;
  position: string | null;
}

export interface MatchLineupData {
  home: MatchLineupPlayer[];
  away: MatchLineupPlayer[];
}

export async function getMatchLineups(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string
): Promise<MatchLineupData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_lineups")
    .select("team_id, is_starter, position, player:players(id, name)")
    .eq("match_id", matchId);

  if (error || !data) return { home: [], away: [] };

  const rows = data.map((row) => ({
    teamId: row.team_id,
    isStarter: row.is_starter ?? false,
    position: row.position,
    playerId: (row.player as unknown as { id: string; name: string } | null)?.id ?? "",
    name: (row.player as unknown as { id: string; name: string } | null)?.name ?? "",
  }));

  return {
    home: rows.filter((r) => r.teamId === homeTeamId),
    away: rows.filter((r) => r.teamId === awayTeamId),
  };
}

export interface HeadToHeadMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  matchDate: string;
}

export async function getHeadToHead(
  currentMatchId: string,
  homeTeamId: string,
  awayTeamId: string
): Promise<HeadToHeadMatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, status, match_date, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
    )
    .or(
      `and(home_team_id.eq.${homeTeamId},away_team_id.eq.${awayTeamId}),and(home_team_id.eq.${awayTeamId},away_team_id.eq.${homeTeamId})`
    )
    .neq("id", currentMatchId)
    .order("match_date", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    homeTeam: (row.home_team as unknown as { name: string } | null)?.name ?? "",
    awayTeam: (row.away_team as unknown as { name: string } | null)?.name ?? "",
    homeScore: row.home_score ?? 0,
    awayScore: row.away_score ?? 0,
    status: row.status ?? "",
    matchDate: row.match_date,
  }));
}

export interface PlayerStatRow {
  playerId: string;
  playerName: string;
  teamName: string;
  count: number;
}

export interface CompetitionPlayerStats {
  topScorers: PlayerStatRow[];
  topAssists: PlayerStatRow[];
  mostCards: PlayerStatRow[];
}

export async function getCompetitionPlayerStats(competitionId: string): Promise<CompetitionPlayerStats> {
  const supabase = await createClient();

  const { data: matchesData } = await supabase.from("matches").select("id").eq("competition_id", competitionId);

  const matchIds = (matchesData ?? []).map((m) => m.id);
  if (matchIds.length === 0) return { topScorers: [], topAssists: [], mostCards: [] };

  const { data: events } = await supabase
    .from("match_events")
    .select(
      "event_type, player:players!player_id(id, name, team:teams(name)), assist_player:players!assist_player