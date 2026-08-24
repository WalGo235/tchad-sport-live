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