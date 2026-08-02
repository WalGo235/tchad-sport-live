import type { Metadata } from "next";
import MatchGridSection from "@/components/MatchGridSection";
import { getMatches } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Matchs — TchadSportLive",
  description: "Tous les matchs de football tchadien : résultats, calendrier et scores en direct.",
};

export const revalidate = 60;

export default async function MatchsPage() {
  const matches = await getMatches();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">MATCHS</h1>
      <MatchGridSection initialMatches={matches} />
    </section>
  );
}