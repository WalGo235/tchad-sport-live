import type { MatchStatus } from "@/components/MatchCard";

const FIRST_HALF = 45;
const STOPPAGE_1 = 5;
const HALFTIME_BREAK = 15;
const SECOND_HALF = 45;
const STOPPAGE_2 = 5;

export interface ComputedMatchState {
  status: MatchStatus;
  minute?: string;
}

/**
 * Calcule automatiquement le statut et la minute d'un match à partir de son
 * heure de coup d'envoi. Ne s'applique que si le statut stocké est
 * "scheduled" et que l'heure est déjà passée — tout autre statut stocké
 * (finished, postponed, ou live/halftime posé à la main) est respecté tel quel.
 */
export function computeMatchClock(storedStatus: string, matchDate: string): ComputedMatchState {
  if (storedStatus !== "scheduled") {
    return { status: storedStatus as MatchStatus };
  }

  const kickoff = new Date(matchDate).getTime();
  const elapsedMin = (Date.now() - kickoff) / 60000;

  if (elapsedMin < 0) {
    return { status: "scheduled" };
  }

  if (elapsedMin < FIRST_HALF) {
    return { status: "live", minute: `${Math.floor(elapsedMin) + 1}'` };
  }

  if (elapsedMin < FIRST_HALF + STOPPAGE_1) {
    const extra = Math.floor(elapsedMin - FIRST_HALF) + 1;
    return { status: "live", minute: `45+${extra}'` };
  }

  if (elapsedMin < FIRST_HALF + STOPPAGE_1 + HALFTIME_BREAK) {
    return { status: "halftime" };
  }

  const secondHalfElapsed = elapsedMin - (FIRST_HALF + STOPPAGE_1 + HALFTIME_BREAK);

  if (secondHalfElapsed < SECOND_HALF) {
    return { status: "live", minute: `${FIRST_HALF + Math.floor(secondHalfElapsed) + 1}'` };
  }

  if (secondHalfElapsed < SECOND_HALF + STOPPAGE_2) {
    const extra = Math.floor(secondHalfElapsed - SECOND_HALF) + 1;
    return { status: "live", minute: `90+${extra}'` };
  }

  return { status: "finished" };
}