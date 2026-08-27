"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

const TABLES = ["teams", "players", "competitions"] as const;
type TableName = (typeof TABLES)[number];

const LABELS: Record<TableName, string> = {
  teams: "club",
  players: "joueur",
  competitions: "compétition",
};

export async function approveItem(table: TableName, id: string) {
  const supabase = await createClient();
  const { data: item } = await supabase.from(table).select("name").eq("id", id).single();

  const { data: current } = await supabase.from(table).select("approval_status").eq("id", id).single();

  if (current?.approval_status === "pending_deletion") {
    await supabase.from(table).delete().eq("id", id);
    await logActivity({
      action: `Suppression confirmée (${LABELS[table]})`,
      entityType: table,
      entityId: id,
      details: { name: item?.name },
    });
  } else {
    await supabase.from(table).update({ approval_status: "approved" }).eq("id", id);
    await logActivity({
      action: `Création approuvée (${LABELS[table]})`,
      entityType: table,
      entityId: id,
      details: { name: item?.name },
    });
  }

  revalidatePath("/admin/validations");
  revalidatePath(`/${table === "teams" ? "clubs" : table === "players" ? "joueurs" : "competitions"}`);
}

export async function rejectItem(table: TableName, id: string) {
  const supabase = await createClient();
  const { data: item } = await supabase.from(table).select("name, approval_status").eq("id", id).single();

  if (item?.approval_status === "pending_deletion") {
    await supabase.from(table).update({ approval_status: "approved" }).eq("id", id);
    await logActivity({
      action: `Suppression annulée (${LABELS[table]})`,
      entityType: table,
      entityId: id,
      details: { name: item?.name },
    });
  } else {
    await supabase.from(table).delete().eq("id", id);
    await logActivity({
      action: `Création rejetée (${LABELS[table]})`,
      entityType: table,
      entityId: id,
      details: { name: item?.name },
    });
  }

  revalidatePath("/admin/validations");
                     }
