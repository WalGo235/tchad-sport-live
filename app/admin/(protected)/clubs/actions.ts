"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadPhoto(
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

export async function upsertClub(clubId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) || null;
  const logoFile = formData.get("logoFile") as File | null;

  const newLogoUrl = await uploadPhoto(supabase, logoFile, "clubs");

  const payload: Record<string, unknown> = { name, city };
  if (newLogoUrl) payload.logo_url = newLogoUrl;

  if (clubId) {
    await supabase.from("teams").update(payload).eq("id", clubId);
  } else {
    await supabase.from("teams").insert(payload);
  }

  revalidatePath("/admin/clubs");
  revalidatePath("/competitions");
}

export async function deleteClub(clubId: string) {
  const supabase = await createClient();
  await supabase.from("teams").delete().eq("id", clubId);
  revalidatePath("/admin/clubs");
}