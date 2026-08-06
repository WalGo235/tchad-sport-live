import { createClient } from "@/lib/supabase/server";
import { deleteNationalMatch, upsertNationalMatch } from "./actions";

export default async function AdminMatchsSaoPage() {
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("national_team_matches")
    .select("id, opponent, home_away, score_us, score_opponent, competition, match_date, venue, status")
    .order("match_date", { ascending: false });

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">MATCHS — LES SAO</h1>

      <form
        action={upsertNationalMatch.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau match</h2>
        <input
          type="text"
          name="opponent"
          required
          placeholder="Adversaire"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <div className="flex gap-3">
          <select name="homeAway" className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="domicile">Domicile</option>
            <option value="exterieur">Extérieur</option>
            <option value="neutre">Terrain neutre</option>
          </select>
          <select name="status" className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="scheduled">À venir</option>
            <option value="live">En direct</option>
            <option value="finished">Terminé</option>
            <option value="postponed">Reporté</option>
          </select>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            name="scoreUs"
            placeholder="Score Sao"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <input
            type="number"
            name="scoreOpponent"
            placeholder="Score adversaire"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <input
          type="text"
          name="competition"
          placeholder="Compétition (ex: Amical, CAN qualif.)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="datetime-local"
          name="matchDate"
          required
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
        />
        <input
          type="text"
          name="venue"
          placeholder="Lieu"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Matchs enregistrés</h2>
      <div className="space-y-4">
        {matches?.map((match) => (
          <details key={match.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              Sao {match.score_us ?? "-"} - {match.score_opponent ?? "-"} {match.opponent}
            </summary>
            <form action={upsertNationalMatch.bind(null, match.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="opponent"
                required
                defaultValue={match.opponent}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <div className="flex gap-3">
                <select
                  name="homeAway"
                  defaultValue={match.home_away ?? "domicile"}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                >
                  <option value="domicile">Domicile</option>
                  <option value="exterieur">Extérieur</option>
                  <option value="neutre">Terrain neutre</option>
                </select>
                <select
                  name="status"
                  defaultValue={match.status ?? "scheduled"}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                >
                  <option value="scheduled">À venir</option>
                  <option value="live">En direct</option>
                  <option value="finished">Terminé</option>
                  <option value="postponed">Reporté</option>
                </select>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  name="scoreUs"
                  defaultValue={match.score_us ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
                <input
                  type="number"
                  name="scoreOpponent"
                  defaultValue={match.score_opponent ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <input
                type="text"
                name="competition"
                defaultValue={match.competition ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="datetime-local"
                name="matchDate"
                required
                defaultValue={match.match_date?.slice(0, 16)}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="venue"
                defaultValue={match.venue ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteNationalMatch.bind(null, match.id)} className="mt-2">
              <button type="submit" className="text-live text-sm hover:underline">
                Supprimer
              </button>
            </form>
          </details>
        ))}
      </div>
    </section>
  );
}