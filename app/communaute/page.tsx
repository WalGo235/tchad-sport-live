import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getForumTopics } from "@/lib/queries-forum";
import { createTopic } from "./actions";

export const metadata: Metadata = {
  title: "Communauté — TchadSportLive",
  description: "Échange avec les autres supporters du football tchadien.",
};

export const revalidate = 30;

export default async function CommunautePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const topics = await getForumTopics();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl tracking-wide">COMMUNAUTÉ</h1>
        {user ? (
          <form action="/communaute/deconnexion" method="POST">
            <button type="submit" className="text-xs text-muted hover:text-sand underline">
              Déconnexion
            </button>
          </form>
        ) : null}
      </div>

      {user ? (
        <>
          <p className="text-sm text-gold mb-6">
            Connecté en tant que {(user.user_metadata?.display_name as string) ?? user.email}
          </p>
          <form action={createTopic} className="bg-surface border border-white/10 rounded-lg p-4 space-y-3 mb-10">
            <h2 className="font-semibold mb-2">Nouveau sujet</h2>
            <input
              type="text"
              name="title"
              required
              placeholder="Titre du sujet"
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
            />
            <textarea
              name="content"
              required
              rows={4}
              placeholder="De quoi veux-tu parler ?"
              className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
            />
            <button
              type="submit"
              className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Publier le sujet
            </button>
          </form>
        </>
      ) : (
        <div className="flex gap-3 mb-10">
          <Link
            href="/communaute/connexion"
            className="bg-gold text-night font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Se connecter
          </Link>
          <Link
            href="/communaute/inscription"
            className="border border-white/10 text-sand font-semibold rounded-lg px-6 py-3 hover:border-gold/50 transition-colors"
          >
            S&apos;inscrire
          </Link>
          <p className="text-sm text-muted self-center">pour participer</p>
        </div>
      )}

      <h2 className="font-semibold mb-4">Sujets récents</h2>
      {topics.length === 0 ? (
        <p className="text-muted">Aucun sujet pour l&apos;instant — sois le premier à en lancer un.</p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/communaute/${topic.id}`}
              className="block bg-surface border border-white/10 rounded-lg p-4 hover:border-gold/50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <p className="font-semibold mb-1">{topic.title}</p>
              <p className="text-sm text-muted line-clamp-2 mb-2">{topic.content}</p>
              <p className="text-xs text-muted">
                Par {topic.authorName} · {new Date(topic.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}