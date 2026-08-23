"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClubListItem } from "@/lib/queries";

export default function ClubsSearchGrid({ clubs }: { clubs: ClubListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = clubs.filter((club) => {
    const q = query.toLowerCase();
    return club.name.toLowerCase().includes(q) || (club.city ?? "").toLowerCase().includes(q);
  });

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un club, une ville..."
        className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted mb-6 focus:outline-none focus:border-gold"
      />

      {filtered.length === 0 ? (
        <p className="text-muted">Aucun club ne correspond à ta recherche.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="bg-surface border border-white/10 rounded-lg p-4 flex items-center gap-3 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              {club.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={club.logoUrl} alt={club.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold">
                  {club.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{club.name}</p>
                {club.city && <p className="text-sm text-muted">{club.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}