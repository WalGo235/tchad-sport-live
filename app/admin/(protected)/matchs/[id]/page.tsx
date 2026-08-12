import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addEvent, deleteEvent, upsertStats } from "./actions";

const STAT_ROWS: { key: string; label: string }[] = [
  { key: "possession", label: "Possession (%)" },
  { key: "shots", label: "Tirs" },
  { key: "shotsOnTarget", label: "Tirs cadrés" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fautes" },
  { key: "offsides", label: "Hors-jeu" },
];

const EVENT_LABEL: Record<string, string> = {
  but: "⚽ But",
  carton_jaune: "🟨 Carton jaune",
  carton_rouge: "🟥 Carton rouge",
};

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, home_score, away_score, home_team_id, away_team_id, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)"
    )
    .eq("id", id)
    .single();

  if (!match) notFound();

  const [{ data: stats }, { data: homePlayers }, { data: awayPlayers }, { data: events }] = await Promise.all([
    supabase.from("match_stats").select("*").eq("match_id", id).maybeSingle(),
    supabase.from("players").select("id, name").eq("team_id", match.home_team_id).order("name"),
    supabase.from("players").select("id, name").eq("team_id", match.away_team_id).order("name"),
    supabase
      .from("match_events")
      .select("id, event_type, minute, team_id, player:players(name)")
      .eq("match_id", id)
      .order("minute"),
  ]);

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

      <div className="bg-surface border border-white/10 rounded-lg p-4">
        <h2 className="font-semibold mb-4">Événements (buts, cartons)</h2>

        {events && events.length > 0 && (
          <div className="space-y-2 mb-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between bg-night border border-white/10 rounded-lg px-3 py-2">
                <span className="text-sm">
                  {event.minute ?? ""} — {EVENT_LABEL[event.event_type ?? ""] ?? event.event_type}
                  {(event.player as unknown as { name: string } | null)?.name
                    ? ` — ${(event.player as unknown as { name: string }).name}`
                    : ""}
                </span>
                <form action={deleteEvent.bind(null, id, event.id)}>
                  <button type="submit" className="text-live text-xs hover:underline">
                    Supprimer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addEvent.bind(null, id)} className="space-y-3">
          <select name="teamId" required className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="">— Équipe —</option>
            <option value={match.home_team_id}>{homeTeam}</option>
            <option value={match.away_team_id}>{awayTeam}</option>
          </select>
          <select name="playerId" className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="">— Joueur (optionnel) —</option>
            <optgroup label={homeTeam}>
              {homePlayers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={awayTeam}>
              {awayPlayers?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
          <div className="flex gap-3">
            <select name="eventType" required className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
              <option value="but">⚽ But</option>
              <option value="carton_jaune">🟨 Carton jaune</option>
              <option value="carton_rouge">🟥 Carton rouge</option>
            </select>
            <input
              type="text"
              name="minute"
              placeholder="34'"
              required
              className="w-24 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Ajouter l&apos;événement
          </button>
        </form>
      </div>
    </section>
  );
}