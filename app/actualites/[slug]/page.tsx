import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Article — TchadSportLive" };

  return {
    title: `${article.title} — TchadSportLive`,
    description: article.content.slice(0, 160),
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-full rounded-lg mb-6 object-cover max-h-96"
        />
      )}
      <p className="text-sm text-muted mb-2">{article.publishedAt}</p>
      <h1 className="font-display text-3xl sm:text-4xl tracking-wide mb-6">{article.title}</h1>
      <div className="text-muted leading-relaxed whitespace-pre-line">{article.content}</div>
      <p className="text-sm text-muted mt-8">Par {article.author}</p>
    </article>
  );
}