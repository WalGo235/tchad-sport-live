import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetitionDetail, getMatchesByCompetition } from "@/lib/queries";
import { getCompetitionPlayerStats } from "@/lib/queries-match-details";
import MatchScheduleCard from "@/components/MatchScheduleCard";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const competition = await getCompetitionDetail(id);

  if (!competition) return { title: "Compétition — TchadSportLive" };

  return {
    title: `${competition.name} — TchadSportLive`,
    description: `Classement et clubs de ${competition.name}${
      competition.season ? ` (saison ${competition.season})` : ""
    } sur TchadSportLive.`,
  };
}

function PlayerStatColumn({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: string;
  rows: { playerId: string; playerName: string; teamName: string; count: number }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-gold mb-2">
        {icon} {title}
      </h3>
      <div className="space-y-1">
        {rows.map((p) => (
          <div
            key={p.playerId}
            className="flex items-center justify-between text-sm bg-surface border border-white/10 rounded-lg px-3 py-2"
          >
            <div>
              <p>{p.playerName}</p>
              <p className="text-xs text-muted">{p.teamName}</p>
            </div>
            <span className="font-mono text-gold font-bold">{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [competition, matches, playerStats] = await Promise.all([
    getCompetitionDetail(id),
    getMatchesByCompetition(id),
    getCompetitionPlayerStats(id),
  ]);

  if (!competition) notFound();

  const hasPlayerStats =
    playerStats.topScorers.length > 0 || playerStats.topAssists.length > 0 || playerStats.mostCards.length > 0;

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">{competition.name}</h1>
      <p className="text-muted mb-8">
        {[competition.season, competition.isOfficial ? null : competition.category].filter(Boolean).join(" · ")}
      </p>

      {competition.standings.length > 0 && (
        <>
          <h2 className="font-display text-2xl tracking-wide mb-4">CLASSEMENT</h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-muted text-left border-b border-white/10">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Équipe</th>
                  <th className="py-2 px-2 text-center">J</th>
                  <th className="py-2 px-2 text-center">G</th>
                  <th className="py-2 px-2 text-center">N</th>
                  <th className="py-2 px-2 text-center">P</th>
                  <th className="py-2 px-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {competition.standings.map((row) => (
                  <tr key={row.rank} className="border-b border-white/5">
                    <td className="py-2 pr-2 text-muted">{row.rank}</td>
                    <td className="py-2 pr-2 font-body">{row.team}</td>
                    <td className="py-2 px-2 text-center">{row.played}</td>
                    <td className="py-2 px-2 text-center">{row.wins}</td>
                    <td className="py-2 px-2 text-center">{row.draws}</td>
                    <td className="py-2 px-2 text-center">{row.losses}</td>
                    <td className="py-2 px-2 text-center text-gold font-bold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hasPlayerStats && (
        <div className="mb-10">
          <h2 className="font-display text-2xl tracking-wide mb-4">STATISTIQUES INDIVIDUELLES</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <PlayerStatColumn title="Buteurs" icon="⚽" rows={playerStats.topScorers} />
            <PlayerStatColumn title="Passeurs" icon="🅰️" rows={playerStats.topAssists} />
            <PlayerStatColumn title="Cartons" icon="🟨" rows={playerStats.mostCards} />
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-2xl tracking-wide mb-4">CALENDRIER</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchScheduleCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {competition.format !== "championnat" && competition.phases.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-2xl tracking-wide mb-4">PHASES</h2>
          <div className="flex flex-wrap gap-2">
            {competition.phases.map((phase) => (
              <span key={phase.id} className="bg-surface border border-white/10 rounded-full px-4 py-2 text-sm">
                {phase.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {competition.clubs.length > 0 && (
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-4">CLUBS</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {competition.clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="bg-surface border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                <p className="font-semibold">{club.name}</p>
                {club.city && <p className="text-sm text-muted">{club.city}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}