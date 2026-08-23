"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlayerListItem } from "@/lib/queries";

export default function PlayersSearchGrid({ players }: { players: PlayerListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = players.filter((player) => {
    const q = query.toLowerCase();
    return (
      player.name.toLowerCase().includes(q) ||
      (player.position ?? "").toLowerCase().includes(q) ||
      (player.teamName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un joueur, un club, un poste..."
        className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted mb-6 focus:outline-none focus:border-gold"
      />

      {filtered.length === 0 ? (
        <p className="text-muted">Aucun joueur ne correspond à ta recherche.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((player) => (
            <Link
              key={player.id}
              href={`/joueurs/${player.id}`}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-center gap-3 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold text-sm">
                  {player.jerseyNumber ?? player.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{player.name}</p>
                <p className="text-sm text-muted">
                  {player.position}
                  {player.position && player.teamName ? " · " : ""}
                  {player.teamName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}