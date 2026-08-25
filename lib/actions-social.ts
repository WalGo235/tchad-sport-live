"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleLike(targetType: string, targetId: string, revalidateTargetPath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/communaute/connexion");
  }

  const { data: existing } = await supabase
    .from("forum_likes")
    .select("id")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("forum_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("forum_likes").insert({ target_type: targetType, target_id: targetId, user_id: user.id });
  }

  revalidatePath(revalidateTargetPath);
}

export async function createComment(
  targetType: string,
  targetId: string,
  revalidateTargetPath: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/communaute/connexion");
  }

  const content = formData.get("content") as string;
  if (!content?.trim()) return;

  const authorName = (user.user_metadata?.display_name as string) || user.email || "Anonyme";

  const { error } = await supabase
    .from("comments")
    .insert({ target_type: targetType, target_id: targetId, author_id: user.id, author_name: authorName, content });

  if (error) console.error("Erreur ajout commentaire:", error.message);

  revalidatePath(revalidateTargetPath);
}