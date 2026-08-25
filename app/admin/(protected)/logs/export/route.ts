import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("user_email, user_name, action, entity_type, details, created_at")
    .order("created_at", { ascending: false });

  const header = ["Date", "Auteur (nom)", "Auteur (email)", "Action", "Type", "Détails"];
  const rows = (logs ?? []).map((log) => [
    new Date(log.created_at).toLocaleString("fr-FR"),
    log.user_name ?? "",
    log.user_email ?? "",
    log.action ?? "",
    log.entity_type ?? "",
    log.details ? JSON.stringify(log.details) : "",
  ]);

  const csv = [header, ...rows].map((row) => row.map((f) => escapeCsvField(String(f))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="logs_activite.csv"`,
    },
  });
                          }
