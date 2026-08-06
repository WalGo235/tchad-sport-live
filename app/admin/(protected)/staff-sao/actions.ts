"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function upsertStaff(staffId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const role = (formData.get("role") as string) || null;
  const displayOrder = Number(formData.get("displayOrder")) || 0;

  const payload = { name, role, display_order: displayOrder };
  let finalId = staffId;

  if (staffId) {
    await supabase.from("national_team_staff").update(payload).eq("id", staffId);
  } else {
    const { data } = await supabase.from("national_team_staff").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: staffId ? "Modification du staff Sao" : "Ajout au staff Sao",
    entityType: "national_team_staff",
    entityId: finalId ?? undefined,
    details: { name, role },
  });

  revalidatePath("/admin/staff-sao");
  revalidatePath("/equipe-nationale/staff");
}

export async function deleteStaff(staffId: string) {
  const supabase = await createClient();
  const { data: staff } = await supabase.from("national_team_staff").select("name").eq("id", staffId).single();
  await supabase.from("national_team_staff").delete().eq("id", staffId);
  await logActivity({
    action: "Suppression du staff Sao",
    entityType: "national_team_staff",
    entityId: staffId,
    details: { name: staff?.name },
  });
  revalidatePath("/admin/staff-sao");
}
