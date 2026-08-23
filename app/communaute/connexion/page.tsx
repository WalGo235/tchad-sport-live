"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }

    router.push("/communaute");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl tracking-wide mb-6">CONNEXION</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Mot de passe"
          className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted focus:outline-none focus:border-gold"
        />
        {error && <p className="text-live text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4 text-center">
        Pas encore de compte ?{" "}
        <Link href="/communaute/inscription" className="text-gold hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </section>
  );
}
