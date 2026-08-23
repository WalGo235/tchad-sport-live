import type { Metadata } from "next";
import Link from "next/link";
import { getAllPlayers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Joueurs — TchadSportLive",
  description: "Tous les joueurs référencés sur TchadSportLive.",
};

export const revalidate = 300;

export default async function JoueursPage() {
  const players = await getAllPlayers();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">JOUEURS</h1>

      {players.length === 0 ? (
        <p className="text-muted">Aucun joueur enregistré pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/joueurs/${player.id}`}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-center gap-3 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold text-sm">
                  {player.jerseyNumber ?? player.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{player.name}</p>
                <p className="text-sm text-muted">
                  {player.position}
                  {player.position && player.teamName ? " · " : ""}
                  {player.teamName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
