import type { Metadata } from "next";
import { getNationalTeamInfo } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Informations — Les Sao — TchadSportLive",
  description: "Fiche d'identité de l'équipe nationale du Tchad.",
};

export const revalidate = 300;

export default async function InformationsPage() {
  const info = await getNationalTeamInfo();

  const rows = [
    { label: "Année de fondation", value: info?.foundingYear },
    { label: "Classement FIFA", value: info?.fifaRanking },
    { label: "Couleurs", value: info?.colors },
    { label: "Fédération", value: info?.federation },
  ].filter((r) => r.value);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-10">INFORMATIONS</h1>

      {rows.length === 0 ? (
        <p className="text-muted">Informations à venir.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between border-b border-white/5 pb-3">
              <span className="text-muted">{row.label}</span>
              <span className="font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
