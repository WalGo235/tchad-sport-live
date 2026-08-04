"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/logActivity";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const author = (formData.get("author") as string) || "Rédaction";
  const slug = `${slugify(title)}-${Date.now()}`;

  const { data } = await supabase
    .from("articles")
    .insert({ title, content, author, slug })
    .select("id")
    .single();

  await logActivity({
    action: "Ajout d'article",
    entityType: "article",
    entityId: data?.id,
    details: { title },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/actualites");
}

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();

  const { data: article } = await supabase.from("articles").select("title").eq("id", articleId).single();

  await supabase.from("articles").delete().eq("id", articleId);

  await logActivity({
    action: "Suppression d'article",
    entityType: "article",
    entityId: articleId,
    details: { title: article?.title },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/actualites");
}