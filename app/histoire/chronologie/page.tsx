import type { Metadata } from "next";
import { getHistoryEvents } from "@/lib/queries-histoire";

export const metadata: Metadata = {
  title: "Chronologie du football tchadien — TchadSportLive",
  description: "Les grandes dates de l'histoire du football au Tchad.",
};

export const revalidate = 300;

export default async function ChronologiePage() {
  const events = await getHistoryEvents();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">CHRONOLOGIE</h1>
      <p className="text-muted mb-10">L&apos;histoire du football tchadien, date par date</p>

      {events.length === 0 ? (
        <p className="text-muted">Aucun événement enregistré pour l&apos;instant.</p>
      ) : (
        <div className="relative pl-6 border-l border-white/10 space-y-8">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-gold" />
              <p className="font-display text-xl text-gold mb-1">{event.year}</p>
              <p className="font-semibold mb-1">{event.title}</p>
              {event.description && <p className="text-sm text-muted">{event.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
