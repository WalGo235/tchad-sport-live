"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTopic(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/communaute/connexion");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title?.trim() || !content?.trim()) {
    return;
  }

  const authorName = (user.user_metadata?.display_name as string) || user.email || "Anonyme";

  const { data, error } = await supabase
    .from("forum_topics")
    .insert({ author_id: user.id, author_name: authorName, title, content })
    .select("id")
    .single();

  if (error) {
    console.error("Erreur création sujet:", error.message);
    return;
  }

  revalidatePath("/communaute");
  if (data) redirect(`/communaute/${data.id}`);
}

export async function createReply(topicId: string, formData: FormData) {
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
    .from("forum_replies")
    .insert({ topic_id: topicId, author_id: user.id, author_name: authorName, content });

  if (error) console.error("Erreur ajout réponse:", error.message);

  revalidatePath(`/communaute/${topicId}`);
}

export async function toggleLike(targetType: "topic" | "reply", targetId: string, topicId: string) {
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

  revalidatePath(`/communaute/${topicId}`);
}