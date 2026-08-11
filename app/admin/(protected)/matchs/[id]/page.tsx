import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertStats } from "./actions";

const STAT_ROWS: { key: string; label: string }[] = [
  { key: "possession", label: "Possession (%)" },
  { key: "shots", label: "Tirs" },
  { key: "shotsOnTarget", label: "Tirs cadrés" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fautes" },
  { key: "offsides", label: "Hors-jeu" },
];

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: match }, { data: stats }] = await Promise.all([
    supabase
      .from("matches")
      .select("id, home_score, away_score, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
      .eq("id", id)
      .single(),
    supabase.from("match_stats").select("*").eq("match_id", id).maybeSingle(),
  ]);

  if (!match) notFound();

  const homeTeam = (match.home_team as unknown as { name: string } | null)?.name ?? "?";
  const awayTeam = (match.away_team as unknown as { name: string } | null)?.name ?? "?";

  const v = (key: string) => {
    const value = stats?.[key as keyof typeof stats];
    return value === null || value === undefined ? "" : (value as number);
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/admin/matchs" className="text-sm text-gold hover:underline mb-4 inline-block">
        ← Retour aux matchs
      </Link>
      <h1 className="font-display text-3xl tracking-wide mb-1">
        {homeTeam} {match.home_score} - {match.away_score} {awayTeam}
      </h1>
      <p className="text-muted mb-8">Détails du match</p>

      <div className="bg-surface border border-white/10 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-4">Statistiques</h2>
        <form action={upsertStats.bind(null, id)} className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs text-muted uppercase tracking-wider">
            <span>{homeTeam}</span>
            <span className="text-center">—</span>
            <span className="text-right">{awayTeam}</span>
          </div>
          {STAT_ROWS.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <input
                type="number"
                name={`${row.key}Home`}
                defaultValue={v(`${row.key.replace(/([A-Z])/g, "_$1").toLowerCase()}_home`)}
                className="w-20 bg-night border border-white/10 rounded-lg px-2 py-2 text-sand text-center"
              />
              <span className="flex-1 text-sm text-muted text-center">{row.label}</span>
              <input
                type="number"
                name={`${row.key}Away`}
                defaultValue={v(`${row.key.replace(/([A-Z])/g, "_$1").toLowerCase()}_away`)}
                className="w-20 bg-night border border-white/10 rounded-lg px-2 py-2 text-sand text-center"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Enregistrer les statistiques
          </button>
        </form>
      </div>
    </section>
  );
}
