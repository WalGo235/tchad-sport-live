import { getArticles } from "@/lib/queries";

export const revalidate = 300;

export default async function ActualitesPage() {
  const articles = await getArticles();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">ACTUALITÉS</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-surface border border-white/10 rounded-lg p-4"
          >
            <p className="text-xs text-muted mb-2">{article.publishedAt}</p>
            <h2 className="font-semibold text-lg mb-2">{article.title}</h2>
            <p className="text-sm text-muted">{article.excerpt}</p>
            <p className="text-xs text-muted mt-3">Par {article.author}</p>
          </article>
        ))}
      </div>
    </section>
  );
}