"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function upsertHonor(honorId: string | null, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const year = (formData.get("year") as string) || null;
  const description = (formData.get("description") as string) || null;
  const displayOrder = Number(formData.get("displayOrder")) || 0;

  const payload = { title, year, description, display_order: displayOrder };
  let finalId = honorId;

  if (honorId) {
    await supabase.from("national_honors").update(payload).eq("id", honorId);
  } else {
    const { data } = await supabase.from("national_honors").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: honorId ? "Modification de palmarès" : "Ajout de palmarès",
    entityType: "national_honor",
    entityId: finalId ?? undefined,
    details: { title, year },
  });

  revalidatePath("/admin/palmares");
  revalidatePath("/histoire/palmares");
}

export async function deleteHonor(honorId: string) {
  const supabase = await createClient();
  const { data: honor } = await supabase.from("national_honors").select("title").eq("id", honorId).single();
  await supabase.from("national_honors").delete().eq("id", honorId);
  await logActivity({
    action: "Suppression de palmarès",
    entityType: "national_honor",
    entityId: honorId,
    details: { title: honor?.title },
  });
  revalidatePath("/admin/palmares");
}
