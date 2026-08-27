import { createClient } from "@/lib/supabase/server";
import { approveItem, rejectItem } from "./actions";

export default async function AdminValidationsPage() {
  const supabase = await createClient();

  const [{ data: clubs }, { data: players }, { data: competitions }] = await Promise.all([
    supabase.from("teams").select("id, name, approval_status").in("approval_status", ["pending", "pending_deletion"]),
    supabase
      .from("players")
      .select("id, name, approval_status")
      .in("approval_status", ["pending", "pending_deletion"]),
    supabase
      .from("competitions")
      .select("id, name, approval_status")
      .in("approval_status", ["pending", "pending_deletion"]),
  ]);

  const sections = [
    { table: "teams" as const, title: "Clubs", items: clubs ?? [] },
    { table: "players" as const, title: "Joueurs", items: players ?? [] },
    { table: "competitions" as const, title: "Compétitions", items: competitions ?? [] },
  ];

  const totalPending = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-2">VALIDATIONS</h1>
      <p className="text-muted mb-8">
        {totalPending === 0
          ? "Rien en attente pour l'instant."
          : `${totalPending} élément${totalPending > 1 ? "s" : ""} en attente de ta décision.`}
      </p>

      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.table} className="mb-8">
              <h2 className="text-xs uppercase tracking-wider text-gold mb-3">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.id} className="bg-surface border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{item.name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.approval_status === "pending_deletion"
                            ? "bg-live/10 text-live"
                            : "bg-gold/10 text-gold"
                        }`}
                      >
                        {item.approval_status === "pending_deletion" ? "Suppression demandée" : "Nouvelle création"}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <form action={approveItem.bind(null, section.table, item.id)} className="flex-1">
                        <button
                          type="submit"
                          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
                        >
                          {item.approval_status === "pending_deletion" ? "Confirmer la suppression" : "Valider"}
                        </button>
                      </form>
                      <form action={rejectItem.bind(null, section.table, item.id)} className="flex-1">
                        <button
                          type="submit"
                          className="w-full border border-white/10 text-muted rounded-lg px-4 py-2 text-sm hover:border-live/50 hover:text-live transition-colors"
                        >
                          {item.approval_status === "pending_deletion" ? "Annuler" : "Rejeter"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </section>
  );
}
