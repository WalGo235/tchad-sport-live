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

async function isSuperAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: adminRow } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single();
  return adminRow?.role === "super_admin";
}

export async function approveItem(table: TableName, id: string) {
  const supabase = await createClient();
  if (!(await isSuperAdmin(supabase))) {
    console.error("Action refusée : seul un super_admin peut valider.");
    return;
  }

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
  if (!(await isSuperAdmin(supabase))) {
    console.error("Action refusée : seul un super_admin peut rejeter.");
    return;
  }

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

// --- Modifications proposées (fiches déjà approuvées, modifiées par un gestionnaire) ---

export async function approveEdit(table: TableName, editId: string) {
  const supabase = await createClient();
  if (!(await isSuperAdmin(supabase))) {
    console.error("Action refusée : seul un super_admin peut valider.");
    return;
  }

  const { data: edit } = await supabase.from("pending_edits").select("entity_id, changes").eq("id", editId).single();
  if (!edit) return;

  const { error: updateError } = await supabase
    .from(table)
    .update(edit.changes as Record<string, unknown>)
    .eq("id", edit.entity_id);
  if (updateError) console.error("Erreur application modification:", updateError.message);

  await supabase.from("pending_edits").delete().eq("id", editId);

  await logActivity({
    action: `Modification approuvée (${LABELS[table]})`,
    entityType: table,
    entityId: edit.entity_id,
    details: { name: (edit.changes as Record<string, unknown>)?.name },
  });

  revalidatePath("/admin/validations");
  revalidatePath(`/${table === "teams" ? "clubs" : table === "players" ? "joueurs" : "competitions"}`);
  if (table === "teams") revalidatePath(`/clubs/${edit.entity_id}`);
}

export async function rejectEdit(table: TableName, editId: string) {
  const supabase = await createClient();
  if (!(await isSuperAdmin(supabase))) {
    console.error("Action refusée : seul un super_admin peut rejeter.");
    return;
  }

  const { data: edit } = await supabase.from("pending_edits").select("entity_id, changes").eq("id", editId).single();
  if (!edit) return;

  await supabase.from("pending_edits").delete().eq("id", editId);

  await logActivity({
    action: `Modification rejetée (${LABELS[table]})`,
    entityType: table,
    entityId: edit.entity_id,
    details: { name: (edit.changes as Record<string, unknown>)?.name },
  });

  revalidatePath("/admin/validations");
}
