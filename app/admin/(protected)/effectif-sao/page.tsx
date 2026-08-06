import { createClient } from "@/lib/supabase/server";
import { deleteNationalPlayer, upsertNationalPlayer } from "./actions";

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

export default async function AdminEffectifSaoPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("national_team_players")
    .select("id, name, position, club, jersey_number, caps, goals, is_starter, photo_url")
    .order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">EFFECTIF — LES SAO</h1>

      <form
        action={upsertNationalPlayer.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau joueur</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom complet"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
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
        <input
          type="text"
          name="club"
          placeholder="Club actuel"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <div className="flex gap-3">
          <input
            type="number"
            name="caps"
            placeholder="Sélections"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <input
            type="number"
            name="goals"
            placeholder="Buts"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="isStarter" className="accent-gold" />
          Titulaire habituel (composition type)
        </label>
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

      <h2 className="font-semibold mb-4">Effectif actuel</h2>
      <div className="space-y-4">
        {players?.map((player) => (
          <details key={player.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-3">
              {player.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              {player.jersey_number ? `#${player.jersey_number} ` : ""}
              {player.name}
              {player.is_starter && <span className="text-xs text-gold">★</span>}
            </summary>
            <form action={upsertNationalPlayer.bind(null, player.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={player.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
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
              <input
                type="text"
                name="club"
                defaultValue={player.club ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  name="caps"
                  defaultValue={player.caps ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
                <input
                  type="number"
                  name="goals"
                  defaultValue={player.goals ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="isStarter" defaultChecked={player.is_starter ?? false} className="accent-gold" />
                Titulaire habituel (composition type)
              </label>
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
            <form action={deleteNationalPlayer.bind(null, player.id)} className="mt-2">
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