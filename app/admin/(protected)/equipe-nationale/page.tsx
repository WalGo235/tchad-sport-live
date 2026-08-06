import { createClient } from "@/lib/supabase/server";
import { updateNationalTeamInfo } from "./actions";

export default async function AdminEquipeNationalePage() {
  const supabase = await createClient();
  const { data: info } = await supabase.from("national_team_info").select("*").limit(1).single();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">ÉQUIPE NATIONALE</h1>
      <p className="text-muted mb-6">Aperçu, informations et composition type des Sao</p>

      <form action={updateNationalTeamInfo} className="bg-surface border border-white/10 rounded-lg p-4 space-y-3">
        <div>
          <label className="text-xs text-muted block mb-1">Aperçu / présentation</label>
          <textarea
            name="overview"
            rows={4}
            defaultValue={info?.overview ?? ""}
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Origine du surnom &quot;Les Sao&quot;</label>
          <textarea
            name="nicknameOrigin"
            rows={2}
            defaultValue={info?.nickname_origin ?? ""}
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Année de fondation</label>
            <input
              type="text"
              name="foundingYear"
              defaultValue={info?.founding_year ?? ""}
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Classement FIFA</label>
            <input
              type="text"
              name="fifaRanking"
              defaultValue={info?.fifa_ranking ?? ""}
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Couleurs</label>
            <input
              type="text"
              name="colors"
              defaultValue={info?.colors ?? ""}
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Fédération</label>
            <input
              type="text"
              name="federation"
              defaultValue={info?.federation ?? ""}
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Formation type (ex: 4-3-3)</label>
          <input
            type="text"
            name="formation"
            defaultValue={info?.formation ?? ""}
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Enregistrer
        </button>
      </form>
    </section>
  );
}