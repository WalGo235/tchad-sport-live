import type { Metadata } from "next";
import { getNationalHonors } from "@/lib/queries-histoire";

export const metadata: Metadata = {
  title: "Palmarès national — TchadSportLive",
  description: "Le palmarès du football tchadien à travers les années.",
};

export const revalidate = 300;

export default async function PalmaresPage() {
  const honors = await getNationalHonors();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">PALMARÈS NATIONAL</h1>
      <p className="text-muted mb-10">Les distinctions du football tchadien</p>

      {honors.length === 0 ? (
        <p className="text-muted">Aucune distinction enregistrée pour l&apos;instant.</p>
      ) : (
        <div className="space-y-3">
          {honors.map((honor) => (
            <div key={honor.id} className="bg-surface border border-white/10 rounded-lg p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">{honor.title}</p>
                {honor.year && <p className="text-sm text-gold font-mono">{honor.year}</p>}
              </div>
              {honor.description && <p className="text-sm text-muted mt-1">{honor.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
