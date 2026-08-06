import type { Metadata } from "next";
import { getLegends } from "@/lib/queries-histoire";

export const metadata: Metadata = {
  title: "Légendes du football tchadien — TchadSportLive",
  description: "Les joueurs qui ont marqué l'histoire du football au Tchad.",
};

export const revalidate = 300;

export default async function LegendesPage() {
  const legends = await getLegends();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">LÉGENDES</h1>
      <p className="text-muted mb-10">Les joueurs qui ont marqué le football tchadien</p>

      {legends.length === 0 ? (
        <p className="text-muted">Aucune légende enregistrée pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {legends.map((legend) => (
            <div key={legend.id} className="bg-surface border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {legend.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={legend.photoUrl}
                    alt={legend.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-night border border-white/10 flex items-center justify-center font-display text-gold">
                    {legend.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{legend.name}</p>
                  <p className="text-xs text-muted">
                    {legend.position}
                    {legend.position && legend.era ? " · " : ""}
                    {legend.era}
                  </p>
                </div>
              </div>
              {legend.bio && <p className="text-sm text-muted">{legend.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
