import type { Metadata } from "next";
import { getNationalTeamInfo } from "@/lib/queries-sao";

export const metadata: Metadata = {
  title: "Les Sao — Équipe Nationale — TchadSportLive",
  description: "Présentation de l'équipe nationale de football du Tchad, les Sao.",
};

export const revalidate = 300;

export default async function ApercuPage() {
  const info = await getNationalTeamInfo();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-2">LES SAO</h1>
      <p className="text-muted mb-10">L&apos;équipe nationale de football du Tchad</p>

      {info?.overview ? (
        <p className="text-sm leading-relaxed whitespace-pre-line mb-6">{info.overview}</p>
      ) : (
        <p className="text-muted mb-6">Présentation à venir.</p>
      )}

      {info?.nicknameOrigin && (
        <div className="bg-surface border border-white/10 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-gold mb-2">Pourquoi &quot;Les Sao&quot; ?</p>
          <p className="text-sm text-muted">{info.nicknameOrigin}</p>
        </div>
      )}
    </section>
  );
}
