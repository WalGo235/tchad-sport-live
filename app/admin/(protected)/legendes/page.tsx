import { createClient } from "@/lib/supabase/server";
import { deleteLegend, upsertLegend } from "./actions";

export default async function AdminLegendesPage() {
  const supabase = await createClient();
  const { data: legends } = await supabase
    .from("legends")
    .select("id, name, era, position, bio, photo_url")
    .order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">LÉGENDES</h1>

      <form
        action={upsertLegend.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouvelle légende</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom complet"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <div className="flex gap-3">
          <input
            type="text"
            name="era"
            placeholder="Époque (ex: 1990-2005)"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <input
            type="text"
            name="position"
            placeholder="Poste"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <textarea
          name="bio"
          rows={3}
          placeholder="Biographie"
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

      <h2 className="font-semibold mb-4">Légendes existantes</h2>
      <div className="space-y-4">
        {legends?.map((legend) => (
          <details key={legend.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-3">
              {legend.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={legend.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              {legend.name}
            </summary>
            <form action={upsertLegend.bind(null, legend.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={legend.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  name="era"
                  defaultValue={legend.era ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
                <input
                  type="text"
                  name="position"
                  defaultValue={legend.position ?? ""}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <textarea
                name="bio"
                rows={3}
                defaultValue={legend.bio ?? ""}
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
            <form action={deleteLegend.bind(null, legend.id)} className="mt-2">
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