import type { Metadata } from "next";
import { getHistoricStadiums } from "@/lib/queries-histoire";

export const metadata: Metadata = {
  title: "Stades historiques — TchadSportLive",
  description: "Les stades qui ont marqué l'histoire du football tchadien.",
};

export const revalidate = 300;

export default async function StadesPage() {
  const stadiums = await getHistoricStadiums();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">STADES HISTORIQUES</h1>
      <p className="text-muted mb-10">Les enceintes emblématiques du football tchadien</p>

      {stadiums.length === 0 ? (
        <p className="text-muted">Aucun stade enregistré pour l&apos;instant.</p>
      ) : (
        <div className="space-y-6">
          {stadiums.map((stadium) => (
            <div key={stadium.id} className="bg-surface border border-white/10 rounded-lg p-4">
              {stadium.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stadium.photoUrl} alt={stadium.name} className="w-full rounded-lg mb-3 object-cover" />
              )}
              <p className="font-semibold text-lg">{stadium.name}</p>
              <p className="text-sm text-muted mb-2">
                {[stadium.city, stadium.yearBuilt ? `construit en ${stadium.yearBuilt}` : null]
                  .filter(Boolean)
                  .join(" · ")}
                {stadium.capacity ? ` · ${stadium.capacity.toLocaleString("fr-FR")} places` : ""}
              </p>
              {stadium.description && <p className="text-sm text-muted">{stadium.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
