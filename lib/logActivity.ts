"use server";

import { createClient } from "@/lib/supabase/server";

interface LogActivityParams {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

export async function logActivity({ action, entityType, entityId, details }: LogActivityParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const name = (user.user_metadata?.name as string) || user.email?.split("@")[0] || "Admin";

  await supabase.from("activity_logs").insert({
    user_email: user.email,
    user_name: name,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? {},
  });
}
