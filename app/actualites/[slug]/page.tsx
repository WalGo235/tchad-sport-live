import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/queries";
import { getLikeInfo } from "@/lib/queries-social";
import { toggleLike } from "@/lib/actions-social";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const likeInfo = await getLikeInfo("article", article.id, user?.id ?? null);

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
      <div className="text-muted leading-relaxed whitespace-pre-line mb-6">{article.content}</div>
      <p className="text-sm text-muted mb-6">Par {article.author}</p>

      <form action={toggleLike.bind(null, "article", article.id, `/actualites/${slug}`)}>
        <button
          type="submit"
          className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
            likeInfo.likedByMe ? "bg-gold text-night border-gold" : "border-white/10 text-muted hover:border-gold/50"
          }`}
        >
          👍 {likeInfo.count}
        </button>
      </form>
    </article>
  );
}