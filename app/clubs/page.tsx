import type { Metadata } from "next";
import Link from "next/link";
import { getAllClubs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Clubs — TchadSportLive",
  description: "Tous les clubs de football tchadien référencés sur TchadSportLive.",
};

export const revalidate = 300;

export default async function ClubsPage() {
  const clubs = await getAllClubs();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">CLUBS</h1>

      {clubs.length === 0 ? (
        <p className="text-muted">Aucun club enregistré pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {clubs.map((club) => (
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
    </section>
  );
}
