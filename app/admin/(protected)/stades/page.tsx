import { createClient } from "@/lib/supabase/server";
import { deleteStadium, upsertStadium } from "./actions";

export default async function AdminStadesPage() {
  const supabase = await createClient();
  const { data: stadiums } = await supabase
    .from("historic_stadiums")
    .select("id, name, city, year_built, capacity, description, photo_url")
    .order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">STADES HISTORIQUES</h1>

      <form
        action={upsertStadium.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau stade</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom du stade"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <div className="flex gap-3">
          <input
            type="text"
            name="city"
            placeholder="Ville"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <input
            type="text"
            name="yearBuilt"
            placeholder="Année de construction"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <input
          type="number"
          name="capacity"
          placeholder="Capacité"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <textarea
          name="description"
          rows={3}
          placeholder="Description / histoire du stade"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
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

      <h2 className="font-semibold mb-4">Stades existants</h2>
      <div className="space-y-4">
        {stadiums?.map((stadium) => (
          <details key={stadium.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-3">
              {stadium.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stadium.photo_url} alt="" className="w-8 h-8 rounded object-cover" />
              )}
              {stadium.name}
            </summary>
            <form action={upsertStadium.bind(null, stadium.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={stadium.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  name="city"
                  defaultValue={stadium.city ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
                <input
                  type="text"
                  name="yearBuilt"
                  defaultValue={stadium.year_built ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <input
                type="number"
                name="capacity"
                defaultValue={stadium.capacity ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <textarea
                name="description"
                rows={3}
                defaultValue={stadium.description ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
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
            <form action={deleteStadium.bind(null, stadium.id)} className="mt-2">
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