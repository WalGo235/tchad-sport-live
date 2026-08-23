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

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null,
  folder: string
) {
  if (!file || file.size === 0) return null;

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from("photos").upload(fileName, file);
  if (uploadError) {
    console.error("Erreur upload storage:", uploadError.message);
    return null;
  }

  return `https://iqsrxyuazktyiyhpbzie.supabase.co/storage/v1/object/public/photos/${fileName}`;
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const author = formData.get("author") as string;

  if (!author || !author.trim()) {
    console.error("Erreur création article : auteur manquant");
    return;
  }

  const coverImageUrl = await uploadFile(supabase, formData.get("coverImageFile") as File | null, "articles");

  const slug = `${slugify(title)}-${Date.now()}`;

  const { data } = await supabase
    .from("articles")
    .insert({ title, content, author, slug, cover_image_url: coverImageUrl })
    .select("id")
    .single();

  await logActivity({
    action: "Ajout d'article",
    entityType: "article",
    entityId: data?.id,
    details: { title, author },
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