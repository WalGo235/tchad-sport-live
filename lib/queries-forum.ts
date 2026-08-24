import { createClient } from "./supabase/server";

export interface ForumTopicListItem {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export async function getForumTopics(): Promise<ForumTopicListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics")
    .select("id, title, content, author_name, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    authorName: row.author_name ?? "Anonyme",
    createdAt: row.created_at,
  }));
}