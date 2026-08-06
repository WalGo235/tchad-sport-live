import type { Metadata } from "next";
import { getNationalTeamMatches } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Matchs récents — Les Sao — TchadSportLive",
  description: "Les résultats et prochains matchs de l'équipe nationale du Tchad.",
};

export const revalidate = 60;

const STATUS_LABEL: Record<string, string> = {
  scheduled: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
};

export default async function MatchsRecentsPage() {
  const matches = await getNationalTeamMatches();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-10">MATCHS RÉCENTS</h1>

      {matches.length === 0 ? (
        <p className="text-muted">Aucun match enregistré pour l&apos;instant.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const date = new Date(match.matchDate);
            const formattedDate = date.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const isLive = match.status === "live";

            return (
              <div key={match.id} className="bg-surface border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted uppercase tracking-wider">
                    {match.competition ?? "Amical"}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isLive ? "text-live" : "text-muted"
                    }`}
                  >
                    {isLive && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />}
                    {STATUS_LABEL[match.status] ?? match.status}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-lg mb-2">
                  <span>Tchad {match.homeAway === "exterieur" ? "(ext.)" : ""}</span>
                  <span className="font-bold">
                    {match.scoreUs ?? "-"} - {match.scoreOpponent ?? "-"}
                  </span>
                  <span>{match.opponent}</span>
                </div>
                <p className="text-xs text-muted">
                  {formattedDate}
                  {match.venue ? ` · ${match.venue}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
