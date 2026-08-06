import { createClient } from "./supabase/server";

export interface NationalTeamInfo {
  overview: string | null;
  nicknameOrigin: string | null;
  foundingYear: string | null;
  fifaRanking: string | null;
  colors: string | null;
  federation: string | null;
  formation: string | null;
}

export async function getNationalTeamInfo(): Promise<NationalTeamInfo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("national_team_info").select("*").limit(1).single();
  if (error || !data) return null;
  return {
    overview: data.overview,
    nicknameOrigin: data.nickname_origin,
    foundingYear: data.founding_year,
    fifaRanking: data.fifa_ranking,
    colors: data.colors,
    federation: data.federation,
    formation: data.formation,
  };
}

export interface NationalStaffMember {
  id: string;
  name: string;
  role: string | null;
}

export async function getNationalTeamStaff(): Promise<NationalStaffMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("national_team_staff")
    .select("id, name, role")
    .order("display_order");
  if (error || !data) return [];
  return data;
}

export interface NationalPlayer {
  id: string;
  name: string;
  position: string | null;
  club: string | null;
  jerseyNumber: number | null;
  caps: number | null;
  goals: number | null;
  isStarter: boolean;
  photoUrl: string | null;
}

export async function getNationalTeamPlayers(): Promise<NationalPlayer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("national_team_players")
    .select("id, name, position, club, jersey_number, caps, goals, is_starter, photo_url")
    .order("name");
  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    club: p.club,
    jerseyNumber: p.jersey_number,
    caps: p.caps,
    goals: p.goals,
    isStarter: p.is_starter ?? false,
    photoUrl: p.photo_url,
  }));
}

export interface NationalMatch {
  id: string;
  opponent: string;
  homeAway: string | null;
  scoreUs: number | null;
  scoreOpponent: number | null;
  competition: string | null;
  matchDate: string;
  venue: string | null;
  status: string;
}

export async function getNationalTeamMatches(): Promise<NationalMatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("national_team_matches")
    .select("id, opponent, home_away, score_us, score_opponent, competition, match_date, venue, status")
    .order("match_date", { ascending: false });
  if (error || !data) return [];
  return data.map((m) => ({
    id: m.id,
    opponent: m.opponent,
    homeAway: m.home_away,
    scoreUs: m.score_us,
    scoreOpponent: m.score_opponent,
    competition: m.competition,
    matchDate: m.match_date,
    venue: m.venue,
    status: m.status,
  }));
}
