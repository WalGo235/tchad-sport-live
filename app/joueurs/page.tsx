import type { Metadata } from "next";
import { getAllPlayers } from "@/lib/queries";
import PlayersSearchGrid from "@/components/PlayersSearchGrid";

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
        <PlayersSearchGrid players={players} />
      )}
    </section>
  );
}