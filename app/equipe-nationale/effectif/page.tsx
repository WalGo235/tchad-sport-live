import type { Metadata } from "next";
import { getNationalTeamPlayers } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Effectif actuel — Les Sao — TchadSportLive",
  description: "L'effectif actuel de l'équipe nationale du Tchad.",
};

export const revalidate = 300;

const POSITIONS_ORDER = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

export default async function EffectifPage() {
  const players = await getNationalTeamPlayers();

  const grouped = POSITIONS_ORDER.map((pos) => ({
    position: pos,
    players: players.filter((p) => p.position === pos),
  })).filter((g) => g.players.length > 0);

  const others = players.filter((p) => !POSITIONS_ORDER.includes(p.position ?? ""));

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-10">EFFECTIF ACTUEL</h1>

      {players.length === 0 ? (
        <p className="text-muted">Effectif à venir.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.position}>
              <h2 className="font-display text-xl tracking-wide text-gold mb-4">
                {group.position.toUpperCase()}S
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {group.players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-surface border border-white/10 rounded-lg p-3 flex items-center gap-3"
                  >
                    {player.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-night flex items-center justify-center font-mono text-sm text-gold">
                        {player.jerseyNumber ?? "-"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-muted">
                        {player.club}
                        {player.caps ? ` · ${player.caps} sél.` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {others.length > 0 && (
            <div>
              <h2 className="font-display text-xl tracking-wide text-gold mb-4">AUTRES</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {others.map((player) => (
                  <div key={player.id} className="bg-surface border border-white/10 rounded-lg p-3">
                    <p className="font-semibold text-sm">{player.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
