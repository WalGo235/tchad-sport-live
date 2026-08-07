"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, file);
  if (uploadError) {
    console.error("Erreur upload storage:", uploadError.message);
    return null;
  }

  return `https://iqsrxyuazktyiyhpbzie.supabase.co/storage/v1/object/public/photos/${fileName}`;
}

export async function upsertLegend(legendId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newPhotoUrl = await uploadFile(supabase, formData.get("photoFile") as File | null, "legendes");

  const name = formData.get("name") as string;
  const payload: Record<string, unknown> = {
    name,
    era: (formData.get("era") as string) || null,
    position: (formData.get("position") as string) || null,
    bio: (formData.get("bio") as string) || null,
  };
  if (newPhotoUrl) payload.photo_url = newPhotoUrl;

  let finalId = legendId;

  if (legendId) {
    const { error: updateError } = await supabase.from("legends").update(payload).eq("id", legendId);
    if (updateError) console.error("Erreur mise à jour légende:", updateError.message);
  } else {
    const { data, error: insertError } = await supabase.from("legends").insert(payload).select("id").single();
    if (insertError) console.error("Erreur création légende:", insertError.message);
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: legendId ? "Modification de légende" : "Ajout de légende",
    entityType: "legend",
    entityId: finalId ?? undefined,
    details: { name },
  });

  revalidatePath("/admin/legendes");
  revalidatePath("/histoire/legendes");
}

export async function deleteLegend(legendId: string) {
  const supabase = await createClient();
  const { data: legend } = await supabase.from("legends").select("name").eq("id", legendId).single();
  await supabase.from("legends").delete().eq("id", legendId);
  await logActivity({
    action: "Suppression de légende",
    entityType: "legend",
    entityId: legendId,
    details: { name: legend?.name },
  });
  revalidatePath("/admin/legendes");
}