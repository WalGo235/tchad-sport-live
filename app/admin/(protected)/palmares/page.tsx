import { createClient } from "@/lib/supabase/server";
import { deleteHonor, upsertHonor } from "./actions";

export default async function AdminPalmaresPage() {
  const supabase = await createClient();
  const { data: honors } = await supabase
    .from("national_honors")
    .select("id, title, year, description, display_order")
    .order("display_order");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">PALMARÈS NATIONAL</h1>

      <form
        action={upsertHonor.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouvelle distinction</h2>
        <input
          type="text"
          name="title"
          required
          placeholder="Titre (ex: Champion CEMAC)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="year"
          placeholder="Année"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Description (optionnel)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="number"
          name="displayOrder"
          placeholder="Ordre d'affichage"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Distinctions existantes</h2>
      <div className="space-y-4">
        {honors?.map((honor) => (
          <details key={honor.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              {honor.title} {honor.year ? `(${honor.year})` : ""}
            </summary>
            <form action={upsertHonor.bind(null, honor.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="title"
                required
                defaultValue={honor.title}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="year"
                defaultValue={honor.year ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <textarea
                name="description"
                rows={2}
                defaultValue={honor.description ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="number"
                name="displayOrder"
                defaultValue={honor.display_order ?? 0}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteHonor.bind(null, honor.id)} className="mt-2">
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
