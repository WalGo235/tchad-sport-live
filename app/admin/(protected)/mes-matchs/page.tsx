import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateMyMatch } from "./actions";

export default async function MesMatchsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, status, minute, match_date, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
    )
    .eq("assigned_reporter_id", user.id)
    .order("match_date", { ascending: false });

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-2">MES MATCHS</h1>
      <p className="text-muted mb-8">Les matchs qui te sont assignés</p>

      {!matches || matches.length === 0 ? (
        <p className="text-muted">Aucun match ne t&apos;est encore assigné.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-surface border border-white/10 rounded-lg p-4">
              <p className="font-semibold mb-1">
                {(match.home_team as unknown as { name: string } | null)?.name ?? "?"} vs{" "}
                {(match.away_team as unknown as { name: string } | null)?.name ?? "?"}
              </p>
              <p className="text-xs text-muted mb-4">
                {new Date(match.match_date).toLocaleString("fr-FR")}
              </p>

              <form action={updateMyMatch.bind(null, match.id)} className="space-y-3">
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
                    <option value="extra_time">Prolongation</option>
                    <option value="penalties">Tirs au but</option>
                    <option value="finished">Terminé</option>
                    <option value="postponed">Reporté</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Minute</label>
                  <input
                    type="text"
                    name="minute"
                    defaultValue={match.minute ?? ""}
                    placeholder="67'"
                    className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
                >
                  Mettre à jour
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
