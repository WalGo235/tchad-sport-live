import MatchCard from "@/components/MatchCard";
import { getMatches } from "@/lib/queries";

export const revalidate = 60;

export default async function MatchsPage() {
  const matches = await getMatches();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">MATCHS</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}