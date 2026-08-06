import type { Metadata } from "next";
import { getNationalTeamInfo, getNationalTeamPlayers } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Composition type — Les Sao — TchadSportLive",
  description: "La composition type de l'équipe nationale du Tchad.",
};

export const revalidate = 300;

export default async function CompositionPage() {
  const [info, players] = await Promise.all([getNationalTeamInfo(), getNationalTeamPlayers()]);
  const starters = players.filter((p) => p.isStarter);

  const POSITIONS_ORDER = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
  const grouped = POSITIONS_ORDER.map((pos) => ({
    position: pos,
    players: starters.filter((p) => p.position === pos),
  })).filter((g) => g.players.length > 0);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">COMPOSITION TYPE</h1>
      {info?.formation && <p className="text-gold font-mono mb-10">{info.formation}</p>}

      {starters.length === 0 ? (
        <p className="text-muted">Composition type à venir.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.position}>
              <h2 className="text-xs uppercase tracking-wider text-muted mb-3">{group.position}</h2>
              <div className="flex flex-wrap gap-2">
                {group.players.map((player) => (
                  <span
                    key={player.id}
                    className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
                  >
                    {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
                    {player.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
