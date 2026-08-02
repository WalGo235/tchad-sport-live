import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayerDetail } from "@/lib/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerDetail(id);

  if (!player) return { title: "Joueur — TchadSportLive" };

  return {
    title: `${player.name} — TchadSportLive`,
    description: `Profil de ${player.name}${player.position ? `, ${player.position}` : ""}${
      player.team ? ` à ${player.team.name}` : ""
    } sur TchadSportLive.`,
  };
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerDetail(id);

  if (!player) notFound();

  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center">
      {player.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.photoUrl}
          alt={player.name}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border border-white/10"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-surface border border-white/10 mx-auto mb-6 flex items-center justify-center font-display text-3xl text-gold">
          {player.jerseyNumber ?? "—"}
        </div>
      )}
      <h1 className="font-display text-3xl tracking-wide mb-2">{player.name}</h1>
      <p className="text-muted mb-6">{player.position ?? "Poste non renseigné"}</p>
      {player.team && (
        <Link href={`/clubs/${player.team.id}`} className="inline-block text-gold hover:underline text-sm">
          {player.team.name} →
        </Link>
      )}
    </section>
  );
}