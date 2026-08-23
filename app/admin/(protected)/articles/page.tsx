import { getArticles } from "@/lib/queries";
import { createArticle, deleteArticle } from "./actions";

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-6">ARTICLES</h1>

      <form
        action={createArticle}
        className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10"
      >
        <h2 className="font-semibold mb-2">Nouvel article</h2>
        <input
          type="text"
          name="title"
          required
          placeholder="Titre"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <textarea
          name="content"
          required
          rows={4}
          placeholder="Contenu"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <input
          type="text"
          name="author"
          required
          placeholder="Auteur"
          className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
        />
        <div>
          <label className="text-xs text-muted block mb-1">Photo de couverture (optionnel)</label>
          <input
            type="file"
            name="coverImageFile"
            accept="image/*"
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-gold file:text-night file:font-semibold"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Publier
        </button>
      </form>

      <h2 className="font-semibold mb-4">Articles existants</h2>
      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-surface border border-white/10 rounded-lg p-4 flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-xs text-muted mb-1">{article.publishedAt}</p>
              <p className="font-semibold">{article.title}</p>
            </div>
            <form action={deleteArticle.bind(null, article.id)}>
              <button type="submit" className="text-live text-sm hover:underline shrink-0">
                Supprimer
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}