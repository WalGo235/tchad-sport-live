import { getMatches } from "@/lib/queries";
import { updateMatch } from "./actions";

export default async function AdminMatchsPage() {
  const matches = await getMatches();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">MATCHS</h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <form
            key={match.id}
            action={updateMatch.bind(null, match.id)}
            className="bg-surface border border-white/10 rounded-lg p-4 space-y-3"
          >
            <p className="text-sm text-muted">
              {match.homeTeam} vs {match.awayTeam}
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">
                  Score {match.homeTeam}
                </label>
                <input
                  type="number"
                  name="homeScore"
                  defaultValue={match.homeScore}
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">
                  Score {match.awayTeam}
                </label>
                <input
                  type="number"
                  name="awayScore"
                  defaultValue={match.awayScore}
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Statut</label>
                <select
                  name="status"
                  defaultValue={match.status}
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                >
                  <option value="scheduled">À venir</option>
                  <option value="live">En direct</option>
                  <option value="finished">Terminé</option>
                  <option value="postponed">Reporté</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Minute</label>
                <input
                  type="text"
                  name="minute"
                  defaultValue={match.minute ?? ""}
                  placeholder="67'"
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Mettre à jour
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
