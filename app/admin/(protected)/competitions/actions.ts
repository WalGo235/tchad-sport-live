"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertCompetition(competitionId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const season = (formData.get("season") as string) || null;

  if (competitionId) {
    await supabase.from("competitions").update({ name, season }).eq("id", competitionId);
  } else {
    await supabase.from("competitions").insert({ name, season });
  }

  revalidatePath("/admin/competitions");
  revalidatePath("/matchs");
  revalidatePath("/classements");
}

export async function deleteCompetition(competitionId: string) {
  const supabase = await createClient();
  await supabase.from("competitions").delete().eq("id", competitionId);
  revalidatePath("/admin/competitions");
}
