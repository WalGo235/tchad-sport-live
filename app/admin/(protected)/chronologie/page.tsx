import { createClient } from "@/lib/supabase/server";
import { deleteEvent, upsertEvent } from "./actions";

export default async function AdminChronologiePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("history_events")
    .select("id, year, title, description, display_order")
    .order("display_order");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">CHRONOLOGIE</h1>

      <form
        action={upsertEvent.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouvel événement</h2>
        <div className="flex gap-3">
          <input
            type="text"
            name="year"
            required
            placeholder="Année (ex: 1961)"
            className="w-32 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <input
            type="text"
            name="title"
            required
            placeholder="Titre"
            className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <textarea
          name="description"
          rows={2}
          placeholder="Description (optionnel)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="number"
          name="displayOrder"
          placeholder="Ordre d'affichage (0 = premier)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Événements existants</h2>
      <div className="space-y-4">
        {events?.map((event) => (
          <details key={event.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              {event.year} — {event.title}
            </summary>
            <form action={upsertEvent.bind(null, event.id)} className="space-y-3 mt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  name="year"
                  required
                  defaultValue={event.year}
                  className="w-32 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={event.title}
                  className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                />
              </div>
              <textarea
                name="description"
                rows={2}
                defaultValue={event.description ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="number"
                name="displayOrder"
                defaultValue={event.display_order ?? 0}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteEvent.bind(null, event.id)} className="mt-2">
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
