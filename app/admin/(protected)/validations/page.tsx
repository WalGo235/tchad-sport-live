import { createClient } from "@/lib/supabase/server";
import { approveItem, rejectItem, approveEdit, rejectEdit } from "./actions";

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  description: "Description",
  abbreviation: "Abréviation",
  founded_date: "Date de fondation",
  city: "Ville",
  region: "Région",
  country: "Pays",
  colors: "Couleurs",
  motto: "Devise",
  postal_address: "Adresse postale",
  phone: "Téléphone",
  email: "Email",
  website: "Site web",
  social_links: "Réseaux sociaux",
  president: "Président",
  secretary_general: "Secrétaire général",
  treasurer: "Trésorier",
  sports_director: "Directeur sportif",
  head_coach: "Entraîneur principal",
  assistant_coaches: "Entraîneurs adjoints",
  medical_staff: "Staff médical",
  stadium_name: "Nom du stade",
  stadium_capacity: "Capacité du stade",
  stadium_address: "Adresse du stade",
  training_center: "Centre de formation",
  current_division: "Division actuelle",
  honors: "Palmarès",
  best_historical_ranking: "Meilleur classement historique",
  international_competitions: "Compétitions internationales",
  licensed_members: "Membres licenciés",
  sports_sections: "Sections sportives",
  season_goal: "Objectif de la saison",
  development_strategy: "Stratégie de développement",
  community_engagement: "Engagement communautaire",
  sponsors: "Sponsors",
  logo_url: "Logo",
  stadium_photo_url: "Photo du stade",
  team_photo_url: "Photo de l'équipe",
  registration_doc_url: "Document d'inscription",
};

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

interface ComparisonRow {
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

function buildComparison(
  changes: Record<string, unknown>,
  current: Record<string, unknown> | undefined
): ComparisonRow[] {
  if (!current) return [];
  return Object.keys(FIELD_LABELS)
    .filter((key) => key in changes)
    .map((key) => {
      const before = formatValue(current[key]);
      const after = formatValue(changes[key]);
      return { label: FIELD_LABELS[key], before, after, changed: before !== after };
    });
}

export default async function AdminValidationsPage() {
  const supabase = await createClient();

  const [{ data: clubs }, { data: players }, { data: competitions }, { data: edits }] = await Promise.all([
    supabase.from("teams").select("id, name, approval_status").in("approval_status", ["pending", "pending_deletion"]),
    supabase
      .from("players")
      .select("id, name, approval_status")
      .in("approval_status", ["pending", "pending_deletion"]),
    supabase
      .from("competitions")
      .select("id, name, approval_status")
      .in("approval_status", ["pending", "pending_deletion"]),
    supabase.from("pending_edits").select("id, entity_type, entity_id, changes, submitted_by_name"),
  ]);

  const clubEditEntityIds = (edits ?? []).filter((e) => e.entity_type === "club").map((e) => e.entity_id);
  const { data: currentClubsForEdits } =
    clubEditEntityIds.length > 0
      ? await supabase.from("teams").select("*").in("id", clubEditEntityIds)
      : { data: [] as Record<string, unknown>[] };
  const currentClubById = new Map(
    (currentClubsForEdits ?? []).map((c) => [(c as Record<string, unknown>).id as string, c as Record<string, unknown>])
  );

  const editsFor = (entityType: string) =>
    (edits ?? [])
      .filter((e) => e.entity_type === entityType)
      .map((e) => {
        const changes = e.changes as Record<string, unknown>;
        const current = entityType === "club" ? currentClubById.get(e.entity_id) : undefined;
        return {
          id: e.id as string,
          name: (changes?.name as string) ?? "?",
          submittedBy: e.submitted_by_name as string | null,
          comparison: buildComparison(changes, current),
        };
      });

  const sections = [
    { table: "teams" as const, title: "Clubs", items: clubs ?? [], edits: editsFor("club") },
    { table: "players" as const, title: "Joueurs", items: players ?? [], edits: editsFor("player") },
    { table: "competitions" as const, title: "Compétitions", items: competitions ?? [], edits: editsFor("competition") },
  ];

  const totalPending = sections.reduce((sum, s) => sum + s.items.length + s.edits.length, 0);

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
          (section.items.length > 0 || section.edits.length > 0) && (
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

                {section.edits.map((edit) => (
                  <div key={edit.id} className="bg-surface border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">{edit.name}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">Modification proposée</span>
                    </div>
                    {edit.submittedBy && <p className="text-xs text-muted mb-3">Par {edit.submittedBy}</p>}

                    {edit.comparison.length > 0 && (
                      <div className="mb-4 border border-white/10 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-2 text-xs font-semibold uppercase tracking-wide">
                          <div className="px-3 py-2 bg-live/10 text-live">Actuel</div>
                          <div className="px-3 py-2 bg-green-500/10 text-green-400 border-l border-white/10">
                            Proposé
                          </div>
                        </div>
                        {edit.comparison.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-2 text-sm border-t border-white/5"
                          >
                            <div
                              className={`px-3 py-2 break-words ${
                                row.changed ? "text-live bg-live/5" : "text-muted"
                              }`}
                            >
                              <span className="block text-[10px] opacity-70 mb-0.5">{row.label}</span>
                              {row.before}
                            </div>
                            <div
                              className={`px-3 py-2 border-l border-white/10 break-words ${
                                row.changed ? "text-green-400 bg-green-500/5" : "text-muted"
                              }`}
                            >
                              <span className="block text-[10px] opacity-70 mb-0.5">{row.label}</span>
                              {row.after}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <form action={approveEdit.bind(null, section.table, edit.id)} className="flex-1">
                        <button
                          type="submit"
                          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
                        >
                          Valider
                        </button>
                      </form>
                      <form action={rejectEdit.bind(null, section.table, edit.id)} className="flex-1">
                        <button
                          type="submit"
                          className="w-full border border-white/10 text-muted rounded-lg px-4 py-2 text-sm hover:border-live/50 hover:text-live transition-colors"
                        >
                          Rejeter
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
