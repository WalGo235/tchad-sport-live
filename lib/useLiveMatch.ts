"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchStatus } from "@/components/MatchCard";

interface LiveMatchState {
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: string;
}

interface RealtimeMatchRow {
  home_score: number;
  away_score: number;
  status: string;
  minute: string | null;
}

export function useLiveMatch(matchId: string, initial: LiveMatchState) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const updated = payload.new as RealtimeMatchRow;
          setState({
            homeScore: updated.home_score,
            awayScore: updated.away_score,
            status: updated.status as MatchStatus,
            minute: updated.minute ?? undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return state;
}
