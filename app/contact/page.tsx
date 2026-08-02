import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nous contacter — TchadSportLive",
  description: "Contactez l'équipe de TchadSportLive.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl tracking-wide mb-6">NOUS CONTACTER</h1>
      <p className="text-muted leading-relaxed mb-8">
        Une info à signaler, un résultat à corriger, une question ? Écris-nous,
        on te répond.
      </p>
      <a
        href="mailto:contact@tchadsportlive.com"
        className="inline-block bg-gold text-night font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
      >
        contact@tchadsportlive.com
      </a>
    </section>
  );
}