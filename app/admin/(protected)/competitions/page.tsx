import { createClient } from "@/lib/supabase/server";
import { deleteCompetition, deletePhase, upsertCompetition, upsertPhase } from "./actions";

const CATEGORY_SUGGESTIONS = [
  "Terrain de terre",
  "Mini-stade",
  "Scolaire",
  "Universitaire",
  "Quartier",
  "Municipal",
];

const FORMATS = [
  { value: "championnat", label: "Championnat (classement simple)" },
  { value: "coupe", label: "Coupe (élimination directe)" },
  { value: "groupes_puis_elimination", label: "Phase de groupes puis élimination" },
];

export default async function AdminCompetitionsPage() {
  const supabase = await createClient();

  const [{ data: competitions }, { data: phases }] = await Promise.all([
    supabase.from("competitions").select("id, name, season, is_official, category, format").order("name"),
    supabase.from("competition_phases").select("id, competition_id, name, phase_order, phase_type").order("phase_order"),
  ]);

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
          placeholder="Nom"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="season"
          placeholder="Saison (ex: 2025-2026)"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="isOfficial" defaultChecked className="accent-gold" />
          Compétition officielle (fédérale)
        </label>
        <div>
          <label className="text-xs text-muted block mb-1">Catégorie (si non officielle)</label>
          <input
            type="text"
            name="category"
            list="category-suggestions"
            placeholder="Choisis une suggestion ou tape la tienne"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Format</label>
          <select name="format" defaultValue="championnat" className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Créer
        </button>
      </form>

      <h2 className="font-semibold mb-4">Compétitions existantes</h2>
      <div className="space-y-4">
        {competitions?.map((comp) => {
          const compPhases = phases?.filter((p) => p.competition_id === comp.id) ?? [];
          return (
            <details key={comp.id} className="bg-surface border border-white/10 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold">
                {comp.name} {comp.is_official ? "" : `(${comp.category ?? "informelle"})`}
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
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" name="isOfficial" defaultChecked={comp.is_official ?? true} className="accent-gold" />
                  Compétition officielle (fédérale)
                </label>
                <div>
                  <label className="text-xs text-muted block mb-1">Catégorie (si non officielle)</label>
                  <input
                    type="text"
                    name="category"
                    list="category-suggestions"
                    defaultValue={comp.category ?? ""}
                    placeholder="Choisis une suggestion ou tape la tienne"
                    className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Format</label>
                  <select
                    name="format"
                    defaultValue={comp.format ?? "championnat"}
                    className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
                >
                  Enregistrer
                </button>
              </form>
              <form action={deleteCompetition.bind(null, comp.id)} className="mt-2 mb-4">
                <button type="submit" className="text-live text-sm hover:underline">
                  Supprimer la compétition
                </button>
              </form>

              {comp.format !== "championnat" && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-xs uppercase tracking-wider text-gold mb-3">Phases</h3>
                  {compPhases.map((phase) => (
                    <details key={phase.id} className="bg-night border border-white/10 rounded-lg p-3 mb-2">
                      <summary className="cursor-pointer text-sm">
                        {phase.phase_order}. {phase.name}
                      </summary>
                      <form action={upsertPhase.bind(null, phase.id)} className="space-y-2 mt-3">
                        <input type="hidden" name="competitionId" value={comp.id} />
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={phase.name}
                          className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sand text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="phaseOrder"
                            defaultValue={phase.phase_order ?? 0}
                            placeholder="Ordre"
                            className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sand text-sm"
                          />
                          <input
                            type="text"
                            name="phaseType"
                            defaultValue={phase.phase_type ?? ""}
                            placeholder="Type (groupe, quart, demie, finale)"
                            className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sand text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gold text-night font-semibold rounded-lg px-3 py-1.5 text-sm hover:opacity-90 transition-opacity"
                        >
                          Enregistrer
                        </button>
                      </form>
                      <form action={deletePhase.bind(null, phase.id)} className="mt-1">
                        <button type="submit" className="text-live text-xs hover:underline">
                          Supprimer
                        </button>
                      </form>
                    </details>
                  ))}

                  <form action={upsertPhase.bind(null, null)} className="space-y-2 mt-3">
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nom de la nouvelle phase (ex: Quarts de finale)"
                      className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm placeholder:text-muted"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="phaseOrder"
                        placeholder="Ordre"
                        className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm placeholder:text-muted"
                      />
                      <input
                        type="text"
                        name="phaseType"
                        placeholder="Type (groupe, quart, demie, finale...)"
                        className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm placeholder:text-muted"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gold text-night font-semibold rounded-lg px-3 py-1.5 text-sm hover:opacity-90 transition-opacity"
                    >
                      Ajouter une phase
                    </button>
                  </form>
                </div>
              )}
            </details>
          );
        })}
      </div>

      <datalist id="category-suggestions">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </section>
  );
}