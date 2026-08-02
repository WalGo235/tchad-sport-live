"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchCardData, MatchStatus } from "@/components/MatchCard";

interface RealtimeMatchRow {
  id: string;
  home_score: number;
  away_score: number;
  status: string;
  minute: string | null;
}

export function useLiveMatches(initialMatches: MatchCardData[]) {
  const [matches, setMatches] = useState(initialMatches);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("matches-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        (payload) => {
          const updated = payload.new as RealtimeMatchRow;
          setMatches((current) =>
            current.map((match) =>
              match.id === updated.id
                ? {
                    ...match,
                    homeScore: updated.home_score,
                    awayScore: updated.away_score,
                    status: updated.status as MatchStatus,
                    minute: updated.minute ?? undefined,
                  }
                : match
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return matches;
}
