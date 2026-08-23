import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Communauté — TchadSportLive",
  description: "Échange avec les autres supporters du football tchadien.",
};

export default async function CommunautePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-display text-4xl tracking-wide mb-4">COMMUNAUTÉ</h1>
      <p className="text-muted mb-8">Le forum arrive très bientôt — les sujets et les réponses seront ici.</p>

      {user ? (
        <div>
          <p className="text-sm text-gold mb-4">
            Connecté en tant que {(user.user_metadata?.display_name as string) ?? user.email}
          </p>
          <form action="/communaute/deconnexion" method="POST">
            <button type="submit" className="text-sm text-muted hover:text-sand underline">
              Se déconnecter
            </button>
          </form>
        </div>
      ) : (
        <div className="flex gap-3 justify-center">
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
        </div>
      )}
    </section>
  );
}
