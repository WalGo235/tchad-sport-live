import Link from "next/link";
import HomeLiveSection from "@/components/HomeLiveSection";
import { getArticles, getMatches, getStandings } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [matches, articles, standings] = await Promise.all([
    getMatches(),
    getArticles(),
    getStandings(5),
  ]);

  return (
    <>
      <HomeLiveSection initialMatches={matches} />

      <section className="mx-auto max-w-6xl px-4 py-10 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wide">À LA UNE</h2>
          <Link href="/actualites" className="text-sm text-gold hover:underline">
            Toutes les actus →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="bg-surface border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <p className="text-xs text-muted mb-2">{article.publishedAt}</p>
              <h3 className="font-semibold mb-2">{article.title}</h3>
              <p className="text-sm text-muted line-clamp-3">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wide">CLASSEMENT</h2>
          <Link href="/competitions" className="text-sm text-gold hover:underline">
            Voir les compétitions →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-muted text-left border-b border-white/10">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">Équipe</th>
                <th className="py-2 px-2 text-center">J</th>
                <th className="py-2 px-2 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr key={row.rank} className="border-b border-white/5">
                  <td className="py-2 pr-2 text-muted">{row.rank}</td>
                  <td className="py-2 pr-2 font-body">{row.team}</td>
                  <td className="py-2 px-2 text-center">{row.played}</td>
                  <td className="py-2 px-2 text-center text-gold font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}