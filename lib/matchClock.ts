import type { MatchStatus } from "@/components/MatchCard";

const STOPPAGE_1 = 5;
const HALFTIME_BREAK = 15;
const STOPPAGE_2 = 5;

export interface ComputedMatchState {
  status: MatchStatus;
  minute?: string;
}

/**
 * Calcule automatiquement le statut et la minute d'un match à partir de son
 * heure de coup d'envoi et de la durée d'une mi-temps (45 min par défaut,
 * personnalisable par match). Ne s'applique que si le statut stocké est
 * "scheduled" et que l'heure est déjà passée — tout autre statut stocké
 * (finished, postponed, ou live/halftime posé manuellement) est respecté tel quel.
 */
export function computeMatchClock(
  storedStatus: string,
  matchDate: string,
  halfDuration: number = 45
): ComputedMatchState {
  if (storedStatus !== "scheduled") {
    return { status: storedStatus as MatchStatus };
  }

  const kickoff = new Date(matchDate).getTime();
  const elapsedMin = (Date.now() - kickoff) / 60000;

  if (elapsedMin < 0) {
    return { status: "scheduled" };
  }

  if (elapsedMin < halfDuration) {
    return { status: "live", minute: `${Math.floor(elapsedMin) + 1}'` };
  }

  if (elapsedMin < halfDuration + STOPPAGE_1) {
    const extra = Math.floor(elapsedMin - halfDuration) + 1;
    return { status: "live", minute: `${halfDuration}+${extra}'` };
  }

  if (elapsedMin < halfDuration + STOPPAGE_1 + HALFTIME_BREAK) {
    return { status: "halftime" };
  }

  const secondHalfElapsed = elapsedMin - (halfDuration + STOPPAGE_1 + HALFTIME_BREAK);

  if (secondHalfElapsed < halfDuration) {
    return { status: "live", minute: `${halfDuration + Math.floor(secondHalfElapsed) + 1}'` };
  }

  if (secondHalfElapsed < halfDuration + STOPPAGE_2) {
    const extra = Math.floor(secondHalfElapsed - halfDuration) + 1;
    return { status: "live", minute: `${halfDuration * 2}+${extra}'` };
  }

  return { status: "finished" };
}