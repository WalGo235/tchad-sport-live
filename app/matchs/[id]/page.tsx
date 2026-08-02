import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/queries";
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

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  const date = new Date(match.matchDate);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
      <div className="space-y-2 text-sm text-muted">
        <p className="capitalize">{formattedDate}</p>
        {match.venue && <p>{match.venue}</p>}
      </div>
    </section>
  );
}