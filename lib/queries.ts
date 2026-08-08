import { createClient } from "./supabase/server";
import { computeMatchClock } from "./matchClock";
import type { MatchCardData, MatchStatus } from "@/components/MatchCard";

function formatKickoff(dateString: string) {
  const date = new Date(dateString);
  return date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "h");
}

type MatchRow = {
  id: string;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  match_date: string;
  minute: string | null;
  venue?: string | null;
  competition: { name: string } | null;
  home_team: { name: string; logo_url: string | null } | null;
  away_team: { name: string; logo_url: string | null } | null;
};

function toMatchCard(row: MatchRow): MatchCardData {
  const computed = computeMatchClock(row.status ?? "scheduled", row.match_date);
  return {
    id: row.id,
    competition: row.competition?.name ?? "",
    homeTeam: row.home_team?.name ?? "",
    awayTeam: row.away_team?.name ?? "",
    homeScore: row.home_score ?? 0,
    awayScore: row.away_score ?? 0,
    status: computed.status,
    minute: computed.minute ?? row.minute ?? undefined,
    kickoff: computed.status === "scheduled" ? formatKickoff(row.match_date) : undefined,
    matchDate: row.match_date,
    venue: row.venue ?? undefined,
    homeLogoUrl: row.home_team?.logo_url,
    awayLogoUrl: row.away_team?.logo_url,
  };
}

export async function getMatches(): Promise<MatchCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, status, match_date, minute, venue, competition:competitions(name), home_team:teams!home_team_id(name, logo_url), away_team:teams!away_team_id(name, logo_url)"
    )
    .order("match_date", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as MatchRow[]).map(toMatchCard);
}

export interface MatchDetail {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: string;
  matchDate: string;
  venue?: string;
}

export async function getMatchById(id: string): Promise<MatchDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, status, match_date, minute, venue, competition:competitions(name), home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const row = data as unknown as MatchRow;
  const computed = computeMatchClock(row.status ?? "scheduled", row.match_date);

  return {
    id: row.id,
    competition: row.competition?.name ?? "",
    homeTeam: row.home_team?.name ?? "",
    awayTeam: row.away_team?.name ?? "",
    homeScore: row.home_score ?? 0,
    awayScore: row.away_score ?? 0,
    status: computed.status,
    minute: computed.minute ?? row.minute ?? undefined,
    matchDate: row.match_date,
    venue: row.venue ?? undefined,
  };
}

export interface StandingRow {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

export async function getStandings(limit?: number): Promise<StandingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("standings")
    .select("played, wins, draws, losses, points, team:teams(name)")
    .order("points", { ascending: false });

  if (error || !data) return [];

  const rows = (
    data as unknown as Array<{
      played: number | null;
      wins: number | null;
      draws: number | null;
      losses: number | null;
      points: number | null;
      team: { name: string } | null;
    }>
  ).map((row, index) => ({
    rank: index + 1,
    team: row.team?.name ?? "",
    played: row.played ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0,
    points: row.points ?? 0,
  }));

  return limit ? rows.slice(0, limit) : rows;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
}

export async function getArticles(): Promise<ArticleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, content, author, published_at")
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.content ?? "",
    author: row.author ?? "Rédaction",
    publishedAt: row.published_at?.slice(0, 10) ?? "",
  }));
}

export interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, content, author, published_at")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    content: data.content ?? "",
    author: data.author ?? "Rédaction",
    publishedAt: data.published_at?.slice(0, 10) ?? "",
  };
}

export interface CompetitionListItem {
  id: string;
  name: string;
  season: string | null;
}

export async function getCompetitions(): Promise<CompetitionListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id, name, season")
    .order("name");

  if (error || !data) return [];
  return data;
}

export interface CompetitionDetail {
  id: string;
  name: string;
  season: string | null;
  standings: StandingRow[];
  clubs: { id: string; name: string; city: string | null }[];
}

export async function getCompetitionDetail(id: string): Promise<CompetitionDetail | null> {
  const supabase = await createClient();

  const { data: competition, error: compError } = await supabase
    .from("competitions")
    .select("id, name, season")
    .eq("id", id)
    .single();

  if (compError || !competition) return null;

  const { data: standingsData } = await supabase
    .from("standings")
    .select("played, wins, draws, losses, points, team:teams(id, name, city)")
    .eq("competition_id", id)
    .order("points", { ascending: false });

  const rows = (standingsData ?? []) as unknown as Array<{
    played: number | null;
    wins: number | null;
    draws: number | null;
    losses: number | null;
    points: number | null;
    team: { id: string; name: string; city: string | null } | null;
  }>;

  const standings: StandingRow[] = rows.map((row, index) => ({
    rank: index + 1,
    team: row.team?.name ?? "",
    played: row.played ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0,
    points: row.points ?? 0,
  }));

  const clubs = rows
    .filter((row) => row.team)
    .map((row) => ({
      id: row.team!.id,
      name: row.team!.name,
      city: row.team!.city,
    }));

  return {
    id: competition.id,
    name: competition.name,
    season: competition.season,
    standings,
    clubs,
  };
}

export interface ClubDetail {
  id: string;
  name: string;
  city: string | null;
  logoUrl: string | null;
  players: { id: string; name: string; position: string | null; jerseyNumber: number | null }[];
}

export async function getClubDetail(id: string): Promise<ClubDetail | null> {
  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("teams")
    .select("id, name, city, logo_url")
    .eq("id", id)
    .single();

  if (error || !club) return null;

  const { data: players } = await supabase
    .from("players")
    .select("id, name, position, jersey_number")
    .eq("team_id", id)
    .order("jersey_number", { ascending: true, nullsFirst: false });

  return {
    id: club.id,
    name: club.name,
    city: club.city,
    logoUrl: club.logo_url,
    players: (players ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      jerseyNumber: p.jersey_number,
    })),
  };
}

export interface PlayerDetail {
  id: string;
  name: string;
  position: string | null;
  jerseyNumber: number | null;
  photoUrl: string | null;
  team: { id: string; name: string } | null;
}

export async function getPlayerDetail(id: string): Promise<PlayerDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("id, name, position, jersey_number, photo_url, team:teams(id, name)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    position: data.position,
    jerseyNumber: data.jersey_number,
    photoUrl: data.photo_url,
    team: (data.team as unknown as { id: string; name: string } | null) ?? null,
  };
}