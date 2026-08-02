import type { Metadata } from "next";
import Link from "next/link";
import { getCompetitions } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Compétitions — TchadSportLive",
  description: "Ligue 1 Tchadienne, Coupe du Tchad et toutes les compétitions de football au Tchad.",
};

export const revalidate = 300;

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">COMPÉTITIONS</h1>
      <div className="space-y-4">
        {competitions.map((comp) => (
          <Link
            key={comp.id}
            href={`/competitions/${comp.id}`}
            className="block bg-surface border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <h2 className="font-semibold text-lg">{comp.name}</h2>
            {comp.season && <p className="text-sm text-muted">{comp.season}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}