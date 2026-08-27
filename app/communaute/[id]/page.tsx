import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForumTopicDetail } from "@/lib/queries-forum";
import { createReply, toggleLike } from "../actions";

export const revalidate = 15;

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topic = await getForumTopicDetail(id, user?.id ?? null);

  if (!topic) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/communaute" className="text-sm text-gold hover:underline mb-4 inline-block">
        ← Retour à la Communauté
      </Link>

      <h1 className="font-display text-3xl tracking-wide mb-2">{topic.title}</h1>
      <p className="text-xs text-muted mb-4">
        Par {topic.authorName} · {new Date(topic.createdAt).toLocaleDateString("fr-FR")}
      </p>
      <p className="text-sand leading-relaxed whitespace-pre-line mb-4">{topic.content}</p>

      <form action={toggleLike.bind(null, "topic", topic.id, topic.id)} className="mb-10">
        <button
          type="submit"
          className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
            topic.likedByMe ? "bg-gold text-night border-gold" : "border-white/10 text-muted hover:border-gold/50"
          }`}
        >
          ❤️ {topic.likeCount}
        </button>
      </form>

      <h2 className="font-semibold mb-4">
        {topic.replies.length} réponse{topic.replies.length !== 1 ? "s" : ""}
      </h2>

      <div className="space-y-4 mb-8">
        {topic.replies.map((reply) => (
          <div key={reply.id} className="bg-surface border border-white/10 rounded-lg p-4">
            <p className="text-sand whitespace-pre-line mb-2">{reply.content}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                {reply.authorName} · {new Date(reply.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <form action={toggleLike.bind(null, "reply", reply.id, topic.id)}>
                <button
                  type="submit"
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    reply.likedByMe ? "bg-gold text-night border-gold" : "border-white/10 text-muted hover:border-gold/50"
                  }`}
                >
                  ❤️ {reply.likeCount}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <form
          action={createReply.bind(null, topic.id)}
          className="bg-surface border border-white/10 rounded-lg p-4 space-y-3"
        >
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Ta réponse..."
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Répondre
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/communaute/connexion" className="text-gold hover:underline">
            Connecte-toi
          </Link>{" "}
          pour répondre.
        </p>
      )}
    </section>
  );
}