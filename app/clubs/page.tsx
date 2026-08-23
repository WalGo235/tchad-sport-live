import type { Metadata } from "next";
import { getAllClubs } from "@/lib/queries";
import ClubsSearchGrid from "@/components/ClubsSearchGrid";

export const metadata: Metadata = {
  title: "Clubs — TchadSportLive",
  description: "Tous les clubs de football tchadien référencés sur TchadSportLive.",
};

export const revalidate = 300;

export default async function ClubsPage() {
  const clubs = await getAllClubs();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">CLUBS</h1>

      {clubs.length === 0 ? (
        <p className="text-muted">Aucun club enregistré pour l&apos;instant.</p>
      ) : (
        <ClubsSearchGrid clubs={clubs} />
      )}
    </section>
  );
}