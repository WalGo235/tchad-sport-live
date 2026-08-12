import Link from "next/link";
import type { MatchCardData, MatchStatus } from "./MatchCard";

const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "À venir",
  live: "EN DIRECT",
  halftime: "MI-TEMPS",
  finished: "Terminé",
  postponed: "Reporté",
};

function TeamLogo({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold text-sm">
      {name.charAt(0)}
    </div>
  );
}

export default function MatchScheduleCard({ match }: { match: MatchCardData }) {
  const isLive = match.status === "live";
  const date = match.matchDate ? new Date(match.matchDate) : null;
  const formattedDate = date
    ? date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" })
    : null;

  return (
    <Link
      href={`/matchs/${match.id}`}
      className="block bg-surface border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs bg-night border border-gold/30 text-gold px-3 py-1 rounded-full">
          {match.competition}
        </span>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            isLive
              ? "bg-live/10 text-live"
              : match.status === "finished"
                ? "bg-white/5 text-muted"
                : "bg-gold/10 text-gold"
          }`}
        >
          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />}
          {isLive ? `${STATUS_LABEL.live} · ${match.minute ?? ""}` : STATUS_LABEL[match.status]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamLogo url={match.homeLogoUrl} name={match.homeTeam} />
          <span className="text-sm text-center font-semibold">{match.homeTeam}</span>
        </div>

        <div className="shrink-0 px-2 text-center">
          {match.status === "scheduled" ? (
            <span className="font-mono text-lg text-muted">{match.kickoff ?? "-"}</span>
          ) : (
            <span className="font-mono text-2xl font-bold">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamLogo url={match.awayLogoUrl} name={match.awayTeam} />
          <span className="text-sm text-center font-semibold">{match.awayTeam}</span>
        </div>
      </div>

      {(formattedDate || match.venue) && (
        <div className="flex items-center gap-3 text-xs text-muted mt-4 pt-3 border-t border-white/5">
          {formattedDate && <span>📅 {formattedDate}</span>}
          {match.venue && <span>{match.venue}</span>}
        </div>
      )}
    </Link>
  );
}