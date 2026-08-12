import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/queries";
import { getMatchEvents, getMatchLineups, getMatchStats } from "@/lib/queries-match-details";
import MatchDetailLive from "@/components/MatchDetailLive";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) return { title: "Match — TchadSportLive" };

  return {
    title: `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} — TchadSportLive`,
    description: `${match.competition} : suivez ${match.homeTeam} contre ${match.awayTeam} en direct sur TchadSportLive.`,
  };
}

const EVENT_ICON: Record<string, string> = {
  but: "⚽",
  carton_jaune: "🟨",
  carton_rouge: "🟥",
};

const STAT_ROWS: { key: "possession" | "shots" | "shotsOnTarget" | "corners" | "fouls" | "offsides"; label: string }[] = [
  { key: "possession", label: "Possession" },
  { key: "shots", label: "Tirs" },
  { key: "shotsOnTarget", label: "Tirs cadrés" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fautes" },
  { key: "offsides", label: "Hors-jeu" },
];

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  const [stats, events, lineups] = await Promise.all([
    getMatchStats(id),
    getMatchEvents(id),
    getMatchLineups(id, match.homeTeamId, match.awayTeamId),
  ]);

  const date = new Date(match.matchDate);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasStats = stats && Object.values(stats).some((v) => v !== null);
  const hasLineups = lineups.home.length > 0 || lineups.away.length > 0;

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm text-muted uppercase tracking-wider mb-2">{match.competition}</p>
      <MatchDetailLive
        matchId={match.id}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        initialHomeScore={match.homeScore}
        initialAwayScore={match.awayScore}
        initialStatus={match.status}
        initialMinute={match.minute}
      />
      <div className="space-y-2 text-sm text-muted mb-10">
        <p className="capitalize">{formattedDate}</p>
        {match.venue && <p>{match.venue}</p>}
      </div>

      {events.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl tracking-wide mb-4">ÉVÉNEMENTS</h2>
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-sm bg-surface border border-white/10 rounded-lg px-3 py-2">
                <span className="text-muted font-mono w-10 shrink-0">{e.minute}</span>
                <span>{EVENT_ICON[e.eventType] ?? "•"}</span>
                <span className="flex-1">{e.playerName ?? "—"}</span>
                <span className="text-xs text-muted">
                  {e.teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasStats && (
        <div className="mb-10">
          <h2 className="font-display text-xl tracking-wide mb-4">STATISTIQUES</h2>
          <div className="space-y-3">
            {STAT_ROWS.map((row) => {
              const home = stats![`${row.key}Home` as keyof typeof stats];
              const away = stats![`${row.key}Away` as keyof typeof stats];
              if (home === null && away === null) return null;
              const total = (home ?? 0) + (away ?? 0) || 1;
              const homePct = ((home ?? 0) / total) * 100;
              return (
                <div key={row.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-mono">{home ?? "-"}</span>
                    <span className="text-muted text-xs">{row.label}</span>
                    <span className="font-mono">{away ?? "-"}</span>
                  </div>
                  <div className="h-1.5 bg-night rounded-full overflow-hidden flex">
                    <div className="h-full bg-gold" style={{ width: `${homePct}%` }} />
                    <div className="h-full bg-live" style={{ width: `${100 - homePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasLineups && (
        <div>
          <h2 className="font-display text-xl tracking-wide mb-4">COMPOSITIONS</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { name: match.homeTeam, players: lineups.home },
              { name: match.awayTeam, players: lineups.away },
            ].map((side) => (
              <div key={side.name}>
                <h3 className="text-sm font-semibold mb-2">{side.name}</h3>
                <p className="text-xs text-muted mb-1">Titulaires</p>
                <ul className="text-sm space-y-1 mb-3">
                  {side.players
                    .filter((p) => p.isStarter)
                    .map((p) => (
                      <li key={p.playerId}>
                        {p.name} {p.position ? <span className="text-muted text-xs">({p.position})</span> : null}
                      </li>
                    ))}
                </ul>
                {side.players.some((p) => !p.isStarter) && (
                  <>
                    <p className="text-xs text-muted mb-1">Remplaçants</p>
                    <ul className="text-sm text-muted space-y-1">
                      {side.players
                        .filter((p) => !p.isStarter)
                        .map((p) => (
                          <li key={p.playerId}>{p.name}</li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}