"use client";

import MatchCard from "./MatchCard";
import { useLiveMatches } from "@/lib/useLiveMatches";
import type { MatchCardData } from "./MatchCard";

export default function MatchGridSection({ initialMatches }: { initialMatches: MatchCardData[] }) {
  const matches = useLiveMatches(initialMatches);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
