import { supabase } from "./supabase";
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
  competition: { name: string } | null;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
};

function toMatchCard(row: MatchRow): MatchCardData {
  const status = (row.status ?? "scheduled") as MatchStatus;
  return {
    id: row.id,
    competition: row.competition?.name ?? "",
    homeTeam: row.home_team?.name ?? "",
    awayTeam: row.away_team?.name ?? "",
    homeScore: row.home_score ?? 0,
    awayScore: row.away_score ?? 0,
    status,
    minute: row.minute ?? undefined,
    kickoff: status === "scheduled" ? formatKickoff(row.match_date) : undefined,
  };
}

export async function getMatches(): Promise<MatchCardData[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, status, match_date, minute, competition:competitions(name), home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
    )
    .order("match_date", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as MatchRow[]).map(toMatchCard);
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