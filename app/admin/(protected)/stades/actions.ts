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
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage.from("photos").upload(fileName, file);
  if (error) return null;
  const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
  return data.publicUrl;
}

function numberOrNull(formData: FormData, key: string) {
  const value = formData.get(key) as string;
  return value ? Number(value) : null;
}

export async function upsertStadium(stadiumId: string | null, formData: FormData) {
  const supabase = await createClient();

  const newPhotoUrl = await uploadFile(supabase, formData.get("photoFile") as File | null, "stades-historiques");

  const name = formData.get("name") as string;
  const payload: Record<string, unknown> = {
    name,
    city: (formData.get("city") as string) || null,
    year_built: (formData.get("yearBuilt") as string) || null,
    capacity: numberOrNull(formData, "capacity"),
    description: (formData.get("description") as string) || null,
  };
  if (newPhotoUrl) payload.photo_url = newPhotoUrl;

  let finalId = stadiumId;

  if (stadiumId) {
    await supabase.from("historic_stadiums").update(payload).eq("id", stadiumId);
  } else {
    const { data } = await supabase.from("historic_stadiums").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: stadiumId ? "Modification de stade historique" : "Ajout de stade historique",
    entityType: "historic_stadium",
    entityId: finalId ?? undefined,
    details: { name },
  });

  revalidatePath("/admin/stades");
  revalidatePath("/histoire/stades");
}

export async function deleteStadium(stadiumId: string) {
  const supabase = await createClient();
  const { data: stadium } = await supabase.from("historic_stadiums").select("name").eq("id", stadiumId).single();
  await supabase.from("historic_stadiums").delete().eq("id", stadiumId);
  await logActivity({
    action: "Suppression de stade historique",
    entityType: "historic_stadium",
    entityId: stadiumId,
    details: { name: stadium?.name },
  });
  revalidatePath("/admin/stades");
}
