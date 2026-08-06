import { createClient } from "@/lib/supabase/server";
import { deleteStaff, upsertStaff } from "./actions";

export default async function AdminStaffSaoPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("national_team_staff")
    .select("id, name, role, display_order")
    .order("display_order");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">STAFF TECHNIQUE — SAO</h1>

      <form
        action={upsertStaff.bind(null, null)}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouveau membre du staff</h2>
        <input
          type="text"
          name="name"
          required
          placeholder="Nom complet"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="role"
          placeholder="Rôle (ex: Sélectionneur, Adjoint, Préparateur physique)"
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

      <h2 className="font-semibold mb-4">Staff actuel</h2>
      <div className="space-y-4">
        {staff?.map((member) => (
          <details key={member.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              {member.name} {member.role ? `— ${member.role}` : ""}
            </summary>
            <form action={upsertStaff.bind(null, member.id)} className="space-y-3 mt-4">
              <input
                type="text"
                name="name"
                required
                defaultValue={member.name}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="text"
                name="role"
                defaultValue={member.role ?? ""}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <input
                type="number"
                name="displayOrder"
                defaultValue={member.display_order ?? 0}
                className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
              />
              <button
                type="submit"
                className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </form>
            <form action={deleteStaff.bind(null, member.id)} className="mt-2">
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