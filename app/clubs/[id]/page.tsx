import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubDetail } from "@/lib/queries";

export const revalidate = 300;

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const club = await getClubDetail(id);

  if (!club) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">{club.name}</h1>
      {club.city && <p className="text-muted mb-8">{club.city}</p>}

      <h2 className="font-display text-2xl tracking-wide mb-4">EFFECTIF</h2>
      {club.players.length === 0 ? (
        <p className="text-muted">Aucun joueur enregistré pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {club.players.map((player) => (
            <Link
              key={player.id}
              href={`/joueurs/${player.id}`}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-center justify-between hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span className="font-semibold">{player.name}</span>
              <span className="text-sm text-muted font-mono">
                {player.jerseyNumber ? `#${player.jerseyNumber}` : ""} {player.position}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
