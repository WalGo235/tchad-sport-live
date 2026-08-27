import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubDetail, getMatchesByTeam } from "@/lib/queries";
import MatchScheduleCard from "@/components/MatchScheduleCard";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const club = await getClubDetail(id);

  if (!club) return { title: "Club — TchadSportLive" };

  return {
    title: `${club.name} — TchadSportLive`,
    description: club.description ?? `Effectif, matchs et informations de ${club.name} sur TchadSportLive.`,
  };
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [club, matches] = await Promise.all([getClubDetail(id), getMatchesByTeam(id)]);

  if (!club) notFound();

  const facts = [
    club.stadiumName ? { label: "Stade", value: club.stadiumName } : null,
    club.foundedYear ? { label: "Fondé en", value: club.foundedYear } : null,
    club.currentDivision ? { label: "Division", value: club.currentDivision } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center text-center mb-6">
        {club.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.logoUrl} alt={club.name} className="w-28 h-28 rounded-full object-cover border border-white/10 mb-4" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-surface border border-white/10 flex items-center justify-center font-display text-4xl text-gold mb-4">
            {club.name.charAt(0)}
          </div>
        )}
        <h1 className="font-display text-3xl tracking-wide">{club.name}</h1>
        {club.city && <p className="text-muted mt-1">{club.city}</p>}
      </div>

      {facts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {facts.map((f) => (
            <div key={f.label} className="bg-surface border border-white/10 rounded-lg p-3 text-center">
              <p className="text-xs text-muted mb-1">{f.label}</p>
              <p className="font-semibold text-sm">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {club.description && (
        <div className="mb-10">
          <h2 className="font-display text-xl tracking-wide mb-3">À PROPOS</h2>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{club.description}</p>
        </div>
      )}

      {club.honors && (
        <div className="mb-10">
          <h2 className="font-display text-xl tracking-wide mb-3">PALMARÈS</h2>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{club.honors}</p>
        </div>
      )}

      {club.players.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl tracking-wide mb-4">JOUEURS</h2>
          <div className="space-y-2">
            {club.players.map((player) => (
              <Link
                key={player.id}
                href={`/joueurs/${player.id}`}
                className="flex items-center gap-3 bg-surface border border-white/10 rounded-lg p-3 hover:border-gold/50 transition-colors"
              >
                {player.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-night border border-white/10 flex items-center justify-center font-mono text-sm text-gold">
                    {player.jerseyNumber ?? "-"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">{player.name}</p>
                  <p className="text-xs text-muted">
                    {player.position}
                    {player.nationality ? ` · ${player.nationality}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <h2 className="font-display text-xl tracking-wide mb-4">MATCHS RÉCENTS ET À VENIR</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchScheduleCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}