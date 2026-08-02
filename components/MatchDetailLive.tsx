"use client";

import { useLiveMatch } from "@/lib/useLiveMatch";
import type { MatchStatus } from "./MatchCard";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
};

interface MatchDetailLiveProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  initialHomeScore: number;
  initialAwayScore: number;
  initialStatus: MatchStatus;
  initialMinute?: string;
}

export default function MatchDetailLive({
  matchId,
  homeTeam,
  awayTeam,
  initialHomeScore,
  initialAwayScore,
  initialStatus,
  initialMinute,
}: MatchDetailLiveProps) {
  const live = useLiveMatch(matchId, {
    homeScore: initialHomeScore,
    awayScore: initialAwayScore,
    status: initialStatus,
    minute: initialMinute,
  });

  return (
    <div className="bg-surface border border-white/10 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-sm font-semibold flex items-center gap-1.5 ${
            live.status === "live" ? "text-live" : "text-muted"
          }`}
        >
          {live.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />}
          {live.status === "live" ? `EN DIRECT · ${live.minute ?? ""}` : STATUS_LABEL[live.status]}
        </span>
      </div>
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between text-lg">
          <span className="text-sand">{homeTeam}</span>
          <span className="text-3xl font-bold text-sand">{live.homeScore}</span>
        </div>
        <div className="flex items-center justify-between text-lg">
          <span className="text-sand">{awayTeam}</span>
          <span className="text-3xl font-bold text-sand">{live.awayScore}</span>
        </div>
      </div>
    </div>
  );
}
