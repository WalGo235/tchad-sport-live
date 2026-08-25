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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", "https://tchadsportlive.com"));
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("target_type, target_id, author_name, content, created_at")
    .order("created_at", { ascending: false });

  const header = ["Type de contenu", "ID du contenu", "Auteur", "Commentaire", "Date"];
  const rows = (comments ?? []).map((c) => [
    c.target_type ?? "",
    c.target_id ?? "",
    c.author_name ?? "",
    c.content ?? "",
    new Date(c.created_at).toLocaleString("fr-FR"),
  ]);

  const csv = [header, ...rows].map((row) => row.map((f) => escapeCsvField(String(f))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="comments_likes.csv"`,
    },
  });
}