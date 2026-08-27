"use client";

import { useLiveMatch } from "@/lib/useLiveMatch";
import type { MatchStatus } from "./MatchCard";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "À venir",
  live: "En direct",
  halftime: "Mi-temps",
  extra_time: "Prolongation",
  penalties: "Tirs au but",
  finished: "Terminé",
  postponed: "Reporté",
};

function TeamLogo({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
    );
  }
  return (
    <div className="w-16 h-16 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold text-lg">
      {name.charAt(0)}
    </div>
  );
}

interface MatchDetailLiveProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  initialHomeScore: number;
  initialAwayScore: number;
  initialStatus: MatchStatus;
  initialMinute?: string;
}

export default function MatchDetailLive({
  matchId,
  homeTeam,
  awayTeam,
  homeLogoUrl,
  awayLogoUrl,
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

  const isLive = live.status === "live" || live.status === "extra_time" || live.status === "penalties";

  return (
    <div className="bg-surface border border-white/10 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-center mb-6">
        <span
          className={`text-sm font-semibold flex items-center gap-1.5 ${
            isLive ? "text-live" : "text-muted"
          }`}
        >
          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />}
          {live.status === "live" ? `EN DIRECT · ${live.minute ?? ""}` : STATUS_LABEL[live.status]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamLogo url={homeLogoUrl} name={homeTeam} />
          <span className="text-sm text-center font-semibold">{homeTeam}</span>
        </div>

        <div className="shrink-0 px-2">
          <span className="font-mono text-3xl font-bold">
            {live.homeScore} - {live.awayScore}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamLogo url={awayLogoUrl} name={awayTeam} />
          <span className="text-sm text-center font-semibold">{awayTeam}</span>
        </div>
      </div>
    </div>
  );
}