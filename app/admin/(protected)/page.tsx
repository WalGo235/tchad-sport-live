import Link from "next/link";

export default function AdminDashboard() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">ADMIN</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/matchs"
          className="bg-surface border border-white/10 rounded-lg p-6 hover:border-gold/50 transition-colors"
        >
          <h2 className="font-semibold text-lg mb-1">Matchs</h2>
          <p className="text-sm text-muted">Mettre à jour les scores et statuts</p>
        </Link>
        <Link
          href="/admin/articles"
          className="bg-surface border border-white/10 rounded-lg p-6 hover:border-gold/50 transition-colors"
        >
          <h2 className="font-semibold text-lg mb-1">Articles</h2>
          <p className="text-sm text-muted">Créer et modifier les actualités</p>
        </Link>
      </div>
    </section>
  );
}
