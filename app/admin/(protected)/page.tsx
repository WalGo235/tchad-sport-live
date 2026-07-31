import Link from "next/link";

const SECTIONS = [
  { href: "/admin/matchs", title: "Matchs", desc: "Mettre à jour les scores et statuts" },
  { href: "/admin/articles", title: "Articles", desc: "Créer et modifier les actualités" },
  { href: "/admin/clubs", title: "Clubs", desc: "Ajouter et modifier les clubs" },
  { href: "/admin/joueurs", title: "Joueurs", desc: "Gérer les profils des joueurs" },
  { href: "/admin/competitions", title: "Compétitions", desc: "Créer et modifier les compétitions" },
];

export default function AdminDashboard() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">ADMIN</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-surface border border-white/10 rounded-lg p-6 hover:border-gold/50 transition-colors"
          >
            <h2 className="font-semibold text-lg mb-1">{s.title}</h2>
            <p className="text-sm text-muted">{s.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}