import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addEvent, deleteEvent, updateLineup, upsertStats } from "./actions";
import PossessionInputs from "@/components/PossessionInputs";
import Stepper from "@/components/Stepper";

const STAT_ROWS: { homeKey: string; awayKey: string; dbKey: string; label: string }[] = [
  { homeKey: "shotsHome", awayKey: "shotsAway", dbKey: "shots", label: "Tirs" },
  { homeKey: "shotsOnTargetHome", awayKey: "shotsOnTargetAway", dbKey: "shots_on_target", label: "Tirs cadrés" },
  { homeKey: "cornersHome", awayKey: "cornersAway", dbKey: "corners", label: "Corners" },
  { homeKey: "foulsHome", awayKey: "foulsAway", dbKey: "fouls", label: "Fautes" },
  { homeKey: "offsidesHome", awayKey: "offsidesAway", dbKey: "offsides", label: "Hors-jeu" },
];

const EVENT_LABEL: Record<string, string> = {
  but: "⚽ But",
  carton_jaune: "🟨 Carton jaune",
  carton_rouge: "🟥 Carton rouge",
  remplacement: "🔄 Remplacement",
};

function LineupForm({
  teamId,
  teamName,
  players,
  existingLineup,
  action,
}: {
  teamId: string;
  teamName: string;
  players: { id: string; name: string }[];
  existingLineup: { player_id: string; is_starter: boolean; position: string | null }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const lineupByPlayer = new Map(existingLineup.map((l) => [l.player_id, l]));

  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wider text-gold mb-3">{teamName}</h3>
      <form action={action} className="space-y-2">
        {players.map((player) => {
          const existing = lineupByPlayer.get(player.id);
          const defaultStatus = existing ? (existing.is_starter ? "titulaire" : "remplacant") : "";
          return (
            <div key={player.id} className="flex items-center gap-2 bg-night border border-white/10 rounded-lg p-2">
              <span className="flex-1 text-sm truncate">{player.name}</span>
              <select
                name={`status_${player.id}`}
                defaultValue={defaultStatus}
                className="bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-sand text-xs"
              >
                <option value="">Non convoqué</option>
                <option value="titulaire">Titulaire</option>
                <option value="remplacant">Remplaçant</option>
              </select>
              <input
                type="text"
                name={`position_${player.id}`}
                defaultValue={existing?.position ?? ""}
                placeholder="Poste"
                className="w-20 bg-surface border border-white/10 rounded-lg px-2 py-1.5 text-sand text-xs placeholder:text-muted"
              />
            </div>
          );
        })}
        {players.length === 0 && <p className="text-sm text-muted">Aucun joueur enregistré pour ce club.</p>}
        {players.length > 0 && (
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            Enregistrer la composition — {teamName}
          </button>
        )}
      </form>
    </div>
  );
}

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

  const [{ data: stats }, { data: homePlayers }, { data: awayPlayers }, { data: events }, { data: lineups }] =
    await Promise.all([
      supabase.from("match_stats").select("*").eq("match_id", id).maybeSingle(),
      supabase.from("players").select("id, name").eq("team_id", match.home_team_id).order("name"),
      supabase.from("players").select("id, name").eq("team_id", match.away_team_id).order("name"),
      supabase
        .from("match_events")
        .select(
          "id, event_type, minute, team_id, player:players!player_id(name), substituted_player:players!substituted_player_id(name)"
        )
        .eq("match_id", id)
        .order("minute"),
      supabase.from("match_lineups").select("team_id, player_id, is_starter, position").eq("match_id", id),
    ]);

  const homeTeam = (match.home_team as unknown as { name: string } | null)?.name ?? "?";
  const awayTeam = (match.away_team as unknown as { name: string } | null)?.name ?? "?";

  const v = (key: string): number | "" => {
    const value = stats?.[key as keyof typeof stats];
    return value === null || value === undefined ? "" : (value as number);
  };

  const homeLineup = (lineups ?? []).filter((l) => l.team_id === match.home_team_id);
  const awayLineup = (lineups ?? []).filter((l) => l.team_id === match.away_team_id);

  const allPlayers = [
    ...(homePlayers ?? []).map((p) => ({ ...p, team: homeTeam })),
    ...(awayPlayers ?? []).map((p) => ({ ...p, team: awayTeam })),
  ];

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

          <PossessionInputs defaultHome={v("possession_home")} />

          {STAT_ROWS.map((row) => (
            <div key={row.dbKey} className="flex items-center gap-2">
              <Stepper name={row.homeKey} defaultValue={v(`${row.dbKey}_home`)} align="left" />
              <span className="text-xs text-muted text-center shrink-0 w-20">{row.label}</span>
              <Stepper name={row.awayKey} defaultValue={v(`${row.dbKey}_away`)} align="right" />
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

      <div className="bg-surface border border-white/10 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-4">Événements (buts, cartons, remplacements)</h2>

        {events && events.length > 0 && (
          <div className="space-y-2 mb-4">
            {events.map((event) => {
              const playerName = (event.player as unknown as { name: string } | null)?.name;
              const subName = (event.substituted_player as unknown as { name: string } | null)?.name;
              return (
                <div key={event.id} className="flex items-center justify-between bg-night border border-white/10 rounded-lg px-3 py-2">
                  <span className="text-sm">
                    {event.minute ?? ""} — {EVENT_LABEL[event.event_type ?? ""] ?? event.event_type}
                    {event.event_type === "remplacement"
                      ? ` — ${playerName ?? "?"} remplace ${subName ?? "?"}`
                      : playerName
                        ? ` — ${playerName}`
                        : ""}
                  </span>
                  <form action={deleteEvent.bind(null, id, event.id)}>
                    <button type="submit" className="text-live text-xs hover:underline">
                      Supprimer
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}

        <form action={addEvent.bind(null, id)} className="space-y-3">
          <select name="teamId" required className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
            <option value="">— Équipe —</option>
            <option value={match.home_team_id}>{homeTeam}</option>
            <option value={match.away_team_id}>{awayTeam}</option>
          </select>
          <div className="flex gap-3">
            <select name="eventType" required className="flex-1 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
              <option value="but">⚽ But</option>
              <option value="carton_jaune">🟨 Carton jaune</option>
              <option value="carton_rouge">🟥 Carton rouge</option>
              <option value="remplacement">🔄 Remplacement</option>
            </select>
            <input
              type="text"
              name="minute"
              placeholder="34'"
              required
              className="w-24 bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Joueur (buteur, sanctionné, ou entrant si remplacement)</label>
            <select name="playerId" className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand">
              <option value="">— Joueur —</option>
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
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Joueur sortant (uniquement pour un remplacement)</label>
            <select
              name="substitutedPlayerId"
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand"
            >
              <option value="">— Aucun —</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.team})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Ajouter l&apos;événement
          </button>
        </form>
      </div>

      <div className="bg-surface border border-white/10 rounded-lg p-4">
        <h2 className="font-semibold mb-4">Composition</h2>
        <LineupForm
          teamId={match.home_team_id}
          teamName={homeTeam}
          players={homePlayers ?? []}
          existingLineup={homeLineup}
          action={updateLineup.bind(null, id, match.home_team_id)}
        />
        <LineupForm
          teamId={match.away_team_id}
          teamName={awayTeam}
          players={awayPlayers ?? []}
          existingLineup={awayLineup}
          action={updateLineup.bind(null, id, match.away_team_id)}
        />
      </div>
    </section>
  );
}