"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function upsertCompetition(competitionId: string | null, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const season = (formData.get("season") as string) || null;
  const isOfficial = formData.get("isOfficial") === "on";
  const category = isOfficial ? null : (formData.get("category") as string) || null;
  const format = (formData.get("format") as string) || "championnat";

  const payload = { name, season, is_official: isOfficial, category, format };

  let finalId = competitionId;

  if (competitionId) {
    await supabase.from("competitions").update(payload).eq("id", competitionId);
  } else {
    const { data } = await supabase.from("competitions").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: competitionId ? "Modification de compétition" : "Ajout de compétition",
    entityType: "competition",
    entityId: finalId ?? undefined,
    details: { name, season, isOfficial, category, format },
  });

  revalidatePath("/admin/competitions");
  revalidatePath("/matchs");
  revalidatePath("/competitions");
}

export async function deleteCompetition(competitionId: string) {
  const supabase = await createClient();
  const { data: competition } = await supabase.from("competitions").select("name").eq("id", competitionId).single();
  await supabase.from("competitions").delete().eq("id", competitionId);
  await logActivity({
    action: "Suppression de compétition",
    entityType: "competition",
    entityId: competitionId,
    details: { name: competition?.name },
  });
  revalidatePath("/admin/competitions");
}

export async function upsertPhase(phaseId: string | null, formData: FormData) {
  const supabase = await createClient();

  const competitionId = formData.get("competitionId") as string;
  const name = formData.get("name") as string;
  const phaseOrder = Number(formData.get("phaseOrder")) || 0;
  const phaseType = (formData.get("phaseType") as string) || null;

  const payload = { competition_id: competitionId, name, phase_order: phaseOrder, phase_type: phaseType };

  let finalId = phaseId;

  if (phaseId) {
    await supabase.from("competition_phases").update(payload).eq("id", phaseId);
  } else {
    const { data } = await supabase.from("competition_phases").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: phaseId ? "Modification de phase" : "Ajout de phase",
    entityType: "competition_phase",
    entityId: finalId ?? undefined,
    details: { competitionId, name },
  });

  revalidatePath("/admin/competitions");
}

export async function deletePhase(phaseId: string) {
  const supabase = await createClient();
  await supabase.from("competition_phases").delete().eq("id", phaseId);
  await logActivity({
    action: "Suppression de phase",
    entityType: "competition_phase",
    entityId: phaseId,
    details: {},
  });
  revalidatePath("/admin/competitions");
}