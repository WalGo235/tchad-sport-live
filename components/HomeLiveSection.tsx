"use client";

import MatchScheduleCard from "./MatchScheduleCard";
import AnimatedLogo from "./AnimatedLogo";
import { useLiveMatches } from "@/lib/useLiveMatches";
import type { MatchCardData } from "./MatchCard";

export default function HomeLiveSection({ initialMatches }: { initialMatches: MatchCardData[] }) {
  const matches = useLiveMatches(initialMatches);
  const featured = matches[0];

  return (
    <>
      <AnimatedLogo />
      {featured && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-2">MATCH À LA UNE</h1>
          <p className="text-muted mb-6">Le direct à ne pas manquer</p>
          <div className="max-w-sm">
            <MatchScheduleCard match={featured} />
          </div>
        </section>
      )}
    </>
  );
}