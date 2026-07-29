import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-surface/40 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted">Connecté : {user.email}</span>
        <form action="/admin/logout" method="post">
          <button type="submit" className="text-sm text-gold hover:underline">
            Déconnexion
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
