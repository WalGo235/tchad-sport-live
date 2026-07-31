import { createClient } from "@/lib/supabase/server";
import { deleteCompetition, upsertCompetition } from "./actions";

export default async function AdminCompetitionsPage() {
  const supabase = await createClient();
  const { data: competitions } = await supabase
    .from("competitions")
    .select("id, name, season")
    .order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">COMPÉTITIONS</h1>

      <form
        action={upsertCompetition.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouvelle compétition</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom de la compétition"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="season"
          placeholder="Saison (ex: 2025-2026)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Compétitions existantes</h2>
      <div className="space-y-4">
        {competitions?.map((comp) => (
          <details key={comp.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center justify-between">
              <span>{comp.name}</span>
              <span className="text-xs text-muted font-normal">{comp.season}</span>
            </summary>
            <form action={upsertCompetition.bind(null, comp.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={comp.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="season"
                defaultValue={comp.season ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteCompetition.bind(null, comp.id)} className="mt-2">
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
