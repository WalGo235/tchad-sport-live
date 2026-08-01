import { createClient } from "@/lib/supabase/server";
import { deletePlayer, upsertPlayer } from "./actions";

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

export default async function AdminJoueursPage() {
  const supabase = await createClient();
  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase
      .from("players")
      .select("id, name, position, jersey_number, photo_url, team_id, teams(name)")
      .order("name"),
    supabase.from("teams").select("id, name").order("name"),
  ]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">JOUEURS</h1>

      <form
        action={upsertPlayer.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau joueur</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom du joueur"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <select name="teamId" className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
          <option value="">— Club —</option>
          {teams?.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <select name="position" className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="">— Poste —</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="jerseyNumber"
            placeholder="N°"
            className="w-24 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Photo (optionnel)</label>
          <input
            type="file"
            name="photoFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Joueurs existants</h2>
      <div className="space-y-4">
        {players?.map((player) => (
          <details key={player.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                {player.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                {player.jersey_number ? `#${player.jersey_number} ` : ""}
                {player.name}
              </span>
              <span className="text-xs text-muted font-normal">
                {(player.teams as unknown as { name: string } | null)?.name ?? ""}
              </span>
            </summary>
            <form action={upsertPlayer.bind(null, player.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={player.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <select
                name="teamId"
                defaultValue={player.team_id ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              >
                <option value="">— Club —</option>
                {teams?.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <select
                  name="position"
                  defaultValue={player.position ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                >
                  <option value="">— Poste —</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="jerseyNumber"
                  defaultValue={player.jersey_number ?? ""}
                  className="w-24 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">
                  Nouvelle photo (laisse vide pour garder l&apos;actuelle)
                </label>
                <input
                  type="file"
                  name="photoFile"
                  accept="image/*"
                  className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deletePlayer.bind(null, player.id)} className="mt-2">
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