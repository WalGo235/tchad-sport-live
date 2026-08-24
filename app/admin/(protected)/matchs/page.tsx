import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMatch, deleteMatch, updateMatch } from "./actions";
import MinuteInput from "@/components/MinuteInput";

export default async function AdminMatchsPage() {
  const supabase = await createClient();

  const [{ data: matches }, { data: teams }, { data: competitions }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, home_score, away_score, status, minute, match_date, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
      )
      .order("match_date", { ascending: false }),
    supabase.from("teams").select("id, name").order("name"),
    supabase.from("competitions").select("id, name").order("name"),
  ]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">MATCHS</h1>

      <form
        action={createMatch}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau match</h2>
        <select
          name="competitionId"
          required
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
        >
          <option value="">— Compétition —</option>
          {competitions?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="homeTeamId"
          required
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
        >
          <option value="">— Équipe à domicile —</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="awayTeamId"
          required
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
        >
          <option value="">— Équipe à l'extérieur —</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="matchDate"
          required
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
        />
        <div>
          <label className="text-xs text-muted block mb-1">Temps de jeu</label>
          <select
            name="halfDuration"
            defaultValue="45"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
          >
            <option value="25">25 min x 2</option>
            <option value="30">30 min x 2</option>
            <option value="45">45 min x 2 (standard)</option>
          </select>
          <p className="text-xs text-muted mt-1">
            Utilisé par l&apos;horloge automatique pour savoir quand passer en mi-temps.
          </p>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Statut du match</label>
          <select
            name="status"
            defaultValue="scheduled"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
          >
            <option value="scheduled">À venir</option>
            <option value="live">En direct</option>
            <option value="halftime">Mi-temps</option>
            <option value="finished">Terminé</option>
            <option value="postponed">Reporté</option>
          </select>
          <p className="text-xs text-muted mt-1">
            Laisse "À venir" pour qu&apos;il passe automatiquement en direct à l&apos;heure prévue.
          </p>
        </div>
        <input
          type="text"
          name="venue"
          placeholder="Lieu (optionnel)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Créer le match
        </button>
      </form>

      <h2 className="font-semibold mb-4">Matchs existants</h2>
      <div className="space-y-4">
        {matches?.map((match) => (
          <details key={match.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              {(match.home_team as unknown as { name: string } | null)?.name ?? "?"} {match.home_score} - {match.away_score}{" "}
              {(match.away_team as unknown as { name: string } | null)?.name ?? "?"}
            </summary>

            <Link
              href={`/admin/matchs/${match.id}`}
              className="block text-sm text-gold hover:underline mt-3"
            >
              Détails du match (stats, événements, composition) →
            </Link>

            <form action={updateMatch.bind(null, match.id)} className="space-y-3 mt-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted block mb-1">Score domicile</label>
                  <input
                    type="number"
                    name="homeScore"
                    defaultValue={match.home_score}
                    className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted block mb-1">Score extérieur</label>
                  <input
                    type="number"
                    name="awayScore"
                    defaultValue={match.away_score}
                    className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Statut</label>
                <select
                  name="status"
                  defaultValue={match.status}
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                >
                  <option value="scheduled">À venir</option>
                  <option value="live">En direct</option>
                  <option value="halftime">Mi-temps</option>
                  <option value="finished">Terminé</option>
                  <option value="postponed">Reporté</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Minute</label>
                <MinuteInput defaultValue={match.minute ?? ""} />
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Mettre à jour
              </button>
            </form>
            <form action={deleteMatch.bind(null, match.id)} className="mt-2">
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