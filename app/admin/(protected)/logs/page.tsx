import { createClient } from "@/lib/supabase/server";

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("user_email, user_name, action, entity_type, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl tracking-wide">LOGS D&apos;ACTIVITÉ</h1>
        <a
          href="/admin/logs/export"
          className="bg-gold text-night font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Exporter CSV
        </a>
      </div>

      <p className="text-xs text-muted mb-4">
        Les 200 dernières actions. L&apos;export CSV contient l&apos;historique complet.
      </p>

      <div className="space-y-2">
        {logs?.map((log, i) => (
          <div key={i} className="bg-surface border border-white/10 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{log.action}</span>
              <span className="text-xs text-muted">{new Date(log.created_at).toLocaleString("fr-FR")}</span>
            </div>
            <p className="text-xs text-muted">
              {log.user_name ?? log.user_email} · {log.entity_type}
            </p>
            {log.details && Object.keys(log.details).length > 0 && (
              <p className="text-xs text-muted mt-1 truncate">{JSON.stringify(log.details)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
