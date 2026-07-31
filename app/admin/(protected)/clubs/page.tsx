import { createClient } from "@/lib/supabase/server";
import { deleteClub, upsertClub } from "./actions";

export default async function AdminClubsPage() {
  const supabase = await createClient();
  const { data: clubs } = await supabase
    .from("teams")
    .select("id, name, city, logo_url")
    .order("name");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">CLUBS</h1>

      <form
        action={upsertClub.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau club</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom du club"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="city"
          placeholder="Ville"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="logoUrl"
          placeholder="URL du logo (optionnel)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Ajouter
        </button>
      </form>

      <h2 className="font-semibold mb-4">Clubs existants</h2>
      <div className="space-y-4">
        {clubs?.map((club) => (
          <details key={club.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center justify-between">
              <span>{club.name}</span>
              <span className="text-xs text-muted font-normal">{club.city}</span>
            </summary>
            <form action={upsertClub.bind(null, club.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={club.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="city"
                defaultValue={club.city ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="logoUrl"
                defaultValue={club.logo_url ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteClub.bind(null, club.id)} className="mt-2">
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
