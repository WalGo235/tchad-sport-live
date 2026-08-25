import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasAccess } from "@/lib/permissions";

const MAIN_SECTIONS = [
  { href: "/admin/matchs", title: "Matchs", desc: "Mettre à jour les scores et statuts" },
  { href: "/admin/mes-matchs", title: "Mes matchs", desc: "Le(s) match(s) qui te sont assignés (reporter)" },
  { href: "/admin/articles", title: "Articles", desc: "Créer et modifier les actualités" },
  { href: "/admin/clubs", title: "Clubs", desc: "Ajouter et modifier les clubs" },
  { href: "/admin/joueurs", title: "Joueurs", desc: "Gérer les profils des joueurs" },
  { href: "/admin/competitions", title: "Compétitions", desc: "Créer et modifier les compétitions" },
  { href: "/admin/logs", title: "Logs d'activité", desc: "Qui a fait quoi, et export CSV" },
];

const HISTOIRE_SECTIONS = [
  { href: "/admin/chronologie", title: "Chronologie", desc: "Les grandes dates du football tchadien" },
  { href: "/admin/legendes", title: "Légendes", desc: "Les joueurs qui ont marqué l'histoire" },
  { href: "/admin/palmares", title: "Palmarès national", desc: "Les distinctions du football tchadien" },
  { href: "/admin/stades", title: "Stades historiques", desc: "Les enceintes emblématiques" },
];

const SAO_SECTIONS = [
  { href: "/admin/equipe-nationale", title: "Informations", desc: "Aperçu, infos et composition type" },
  { href: "/admin/staff-sao", title: "Staff technique", desc: "Le staff des Sao" },
  { href: "/admin/effectif-sao", title: "Effectif", desc: "Les joueurs sélectionnés" },
  { href: "/admin/matchs-sao", title: "Matchs", desc: "Résultats et matchs à venir des Sao" },
];

function SectionGrid({ sections }: { sections: typeof MAIN_SECTIONS }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="bg-surface border border-white/10 rounded-lg p-6 hover:border-gold/50 transition-colors"
        >
          <h2 className="font-semibold text-lg mb-1">{s.title}</h2>
          <p className="text-sm text-muted">{s.desc}</p>
        </Link>
      ))}
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "";
  if (user) {
    const { data: adminRow } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single();
    role = adminRow?.role ?? "";
  }

  const visibleMain = MAIN_SECTIONS.filter((s) => hasAccess(role, s.href));
  const visibleHistoire = HISTOIRE_SECTIONS.filter((s) => hasAccess(role, s.href));
  const visibleSao = SAO_SECTIONS.filter((s) => hasAccess(role, s.href));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl tracking-wide mb-8">ADMIN</h1>

      {visibleMain.length > 0 && (
        <>
          <h2 className="text-xs uppercase tracking-wider text-gold mb-4">Site principal</h2>
          <div className="mb-10">
            <SectionGrid sections={visibleMain} />
          </div>
        </>
      )}

      {visibleHistoire.length > 0 && (
        <>
          <h2 className="text-xs uppercase tracking-wider text-gold mb-4">Histoire du football tchadien</h2>
          <div className="mb-10">
            <SectionGrid sections={visibleHistoire} />
          </div>
        </>
      )}

      {visibleSao.length > 0 && (
        <>
          <h2 className="text-xs uppercase tracking-wider text-gold mb-4">Équipe Nationale — Les Sao</h2>
          <SectionGrid sections={visibleSao} />
        </>
      )}
    </section>
  );
}