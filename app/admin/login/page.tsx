"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl tracking-wide mb-6">ADMIN</h1>
      {sent ? (
        <p className="text-muted">
          Lien envoyé à {email}. Ouvre l&apos;e-mail sur ce téléphone pour te connecter.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-sand placeholder:text-muted focus:outline-none focus:border-gold"
          />
          {error && <p className="text-live text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity"
          >
            Recevoir le lien de connexion
          </button>
        </form>
      )}
    </section>
  );
}
