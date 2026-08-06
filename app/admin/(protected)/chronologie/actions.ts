"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

export async function upsertEvent(eventId: string | null, formData: FormData) {
  const supabase = await createClient();

  const year = formData.get("year") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const displayOrder = Number(formData.get("displayOrder")) || 0;

  const payload = { year, title, description, display_order: displayOrder };
  let finalId = eventId;

  if (eventId) {
    await supabase.from("history_events").update(payload).eq("id", eventId);
  } else {
    const { data } = await supabase.from("history_events").insert(payload).select("id").single();
    finalId = data?.id ?? null;
  }

  await logActivity({
    action: eventId ? "Modification d'événement historique" : "Ajout d'événement historique",
    entityType: "history_event",
    entityId: finalId ?? undefined,
    details: { title, year },
  });

  revalidatePath("/admin/chronologie");
  revalidatePath("/histoire/chronologie");
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  const { data: event } = await supabase.from("history_events").select("title").eq("id", eventId).single();
  await supabase.from("history_events").delete().eq("id", eventId);
  await logActivity({
    action: "Suppression d'événement historique",
    entityType: "history_event",
    entityId: eventId,
    details: { title: event?.title },
  });
  revalidatePath("/admin/chronologie");
}
