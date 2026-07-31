"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertClub(clubId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) || null;
  const logoUrl = (formData.get("logoUrl") as string) || null;

  if (clubId) {
    await supabase.from("teams").update({ name, city, logo_url: logoUrl }).eq("id", clubId);
  } else {
    await supabase.from("teams").insert({ name, city, logo_url: logoUrl });
  }

  revalidatePath("/admin/clubs");
  revalidatePath("/classements");
  revalidatePath("/matchs");
}

export async function deleteClub(clubId: string) {
  const supabase = await createClient();
  await supabase.from("teams").delete().eq("id", clubId);
  revalidatePath("/admin/clubs");
}
