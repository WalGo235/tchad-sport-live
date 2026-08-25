import { createClient } from "./supabase/server";

export async function getLikeInfo(
  targetType: string,
  targetId: string,
  userId: string | null
): Promise<{ count: number; likedByMe: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_likes")
    .select("user_id")
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  const count = data?.length ?? 0;
  const likedByMe = userId ? (data ?? []).some((l) => l.user_id === userId) : false;

  return { count, likedByMe };
}

export interface CommentItem {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export async function getComments(targetType: string, targetId: string): Promise<CommentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, author_name, created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    content: c.content,
    authorName: c.author_name ?? "Anonyme",
    createdAt: c.created_at,
  }));
}