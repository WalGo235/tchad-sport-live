"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  await supabase.from("articles").insert({
    title,
    content,
    author,
    slug: `${slugify(title)}-${Date.now()}`,
  });

  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/actualites");
}

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", articleId);

  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath("/actualites");
}
