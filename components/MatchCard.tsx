import Link from "next/link";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "extra_time"
  | "penalties"
  | "finished"
  | "postponed";

export interface MatchCardData {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: string;
  kickoff?: string;
  matchDate?: string;
  venue?: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  penaltyHomeScore?: number | null;
  penaltyAwayScore?: number | null;
}

const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "À venir",
  live: "EN DIRECT",
  halftime: "MI-TEMPS",
  extra_time: "PROLONGATION",
  penalties: "TIRS AU BUT",
  finished: "Terminé",
  postponed: "Reporté",
};

export default function MatchCard({ match }: { match: MatchCardData }) {
  const isLive = match.status === "live" || match.status === "extra_time" || match.status === "penalties";

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="block bg-surface border border-white/10 rounded-lg p-4 min-w-[220px] flex-shrink-0 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted">
          {match.competition}
        </span>
        <span
          className={`text-xs font-semibold flex items-center gap-1.5 ${
            isLive ? "text-live" : "text-muted"
          }`}
        >
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
          )}
          {match.status === "live"
            ? `${STATUS_LABEL.live} · ${match.minute ?? ""}`
            : STATUS_LABEL[match.status]}
        </span>
      </div>
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sand truncate">{match.homeTeam}</span>
          <span className="text-xl font-bold text-sand">{match.homeScore}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sand truncate">{match.awayTeam}</span>
          <span className="text-xl font-bold text-sand">{match.awayScore}</span>
        </div>
        {match.status === "penalties" && match.penaltyHomeScore !== null && match.penaltyHomeScore !== undefined && (
          <p className="text-xs text-gold text-right">
            ({match.penaltyHomeScore} - {match.penaltyAwayScore} tab)
          </p>
        )}
      </div>
      {match.status === "scheduled" && match.kickoff && (
        <p className="text-xs text-muted mt-3">Coup d&apos;envoi {match.kickoff}</p>
      )}
    </Link>
  );
}