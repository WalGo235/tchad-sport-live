"use client";

import { useState } from "react";
import { useLiveMatches } from "@/lib/useLiveMatches";
import MatchScheduleCard from "./MatchScheduleCard";
import type { MatchCardData, MatchStatus } from "./MatchCard";

const FILTERS: { key: "all" | MatchStatus; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "scheduled", label: "À venir" },
  { key: "live", label: "En direct" },
  { key: "finished", label: "Terminés" },
];

export default function MatchsScheduleSection({ initialMatches }: { initialMatches: MatchCardData[] }) {
  const matches = useLiveMatches(initialMatches);
  const [filter, setFilter] = useState<"all" | MatchStatus>("all");

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? "bg-gold text-night" : "bg-surface border border-white/10 text-muted hover:text-sand"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">Aucun match dans cette catégorie.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((match) => (
            <MatchScheduleCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
