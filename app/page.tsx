import Link from "next/link";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";
import { getArticles, getMatches, getStandings } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [matches, articles, standings] = await Promise.all([
    getMatches(),
    getArticles(),
    getStandings(5),
  ]);

  const featured = matches[0];

  return (
    <>
      <LiveTicker matches={matches} />

      {featured && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-2">
            MATCH À LA UNE
          </h1>
          <p className="text-muted mb-6">Le direct à ne pas manquer</p>
          <div className="max-w-sm">
            <MatchCard match={featured} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wide">À LA UNE</h2>
          <Link href="/actualites" className="text-sm text-gold hover:underline">
            Toutes les actus →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-surface border border-white/10 rounded-lg p-4"
            >
              <p className="text-xs text-muted mb-2">{article.publishedAt}</p>
              <h3 className="font-semibold mb-2">{article.title}</h3>
              <p className="text-sm text-muted line-clamp-3">{article.excerpt}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wide">CLASSEMENT</h2>
          <Link href="/classements" className="text-sm text-gold hover:underline">
            Classement complet →
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
                  <td className="py-2 px-2 text-center text-gold font-bold">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}