import MatchCard, { MatchCardData } from "./MatchCard";

export default function LiveTicker({ matches }: { matches: MatchCardData[] }) {
  return (
    <section className="border-b border-white/10 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}