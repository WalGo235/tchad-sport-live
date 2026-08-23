"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <section className="mx-auto max-w-sm px-4 py-20 text-center">
        <h1 className="font-display text-3xl tracking-wide mb-4">VÉRIFIE TES E-MAILS</h1>
        <p className="text-muted">
          Un lien de confirmation vient de t&apos;être envoyé. Clique dessus pour activer ton compte.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl tracking-wide mb-6">REJOINDRE LA COMMUNAUTÉ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="displayName"
          required
          placeholder="Nom affiché"
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted focus:outline-none focus:border-gold"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="ton@email.com"
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="Mot de passe"
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted focus:outline-none focus:border-gold"
        />
        {error && <p className="text-live text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4 text-center">
        Déjà inscrit ?{" "}
        <Link href="/communaute/connexion" className="text-gold hover:underline">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
