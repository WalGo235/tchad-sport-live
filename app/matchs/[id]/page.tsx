import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "À venir",
  live: "En direct",
  finished: "Terminé",
  postponed: "Reporté",
};

export const revalidate = 60;

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  const date = new Date(match.matchDate);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm text-muted uppercase tracking-wider mb-2">{match.competition}</p>
      <div className="bg-surface border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-sm font-semibold flex items-center gap-1.5 ${
              match.status === "live" ? "text-live" : "text-muted"
            }`}
          >
            {match.status === "live" && (
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse" />
            )}
            {match.status === "live"
              ? `EN DIRECT · ${match.minute ?? ""}`
              : STATUS_LABEL[match.status]}
          </span>
        </div>
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between text-lg">
            <span className="text-sand">{match.homeTeam}</span>
            <span className="text-3xl font-bold text-sand">{match.homeScore}</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span className="text-sand">{match.awayTeam}</span>
            <span className="text-3xl font-bold text-sand">{match.awayScore}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted">
        <p className="capitalize">{formattedDate}</p>
        {match.venue && <p>{match.venue}</p>}
      </div>
    </section>
  );
}
