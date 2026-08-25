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
  likeCount: number;
  likedByMe: boolean;
}

export async function getComments(
  targetType: string,
  targetId: string,
  currentUserId: string | null
): Promise<CommentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, author_name, created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const commentIds = data.map((c) => c.id);
  let likes: { target_id: string; user_id: string }[] = [];

  if (commentIds.length > 0) {
    const { data: likesData } = await supabase
      .from("forum_likes")
      .select("target_id, user_id")
      .eq("target_type", "comment")
      .in("target_id", commentIds);
    likes = likesData ?? [];
  }

  const likesByComment = new Map<string, { count: number; likedByMe: boolean }>();
  for (const like of likes) {
    const entry = likesByComment.get(like.target_id) ?? { count: 0, likedByMe: false };
    entry.count += 1;
    if (currentUserId && like.user_id === currentUserId) entry.likedByMe = true;
    likesByComment.set(like.target_id, entry);
  }

  return data.map((c) => {
    const l = likesByComment.get(c.id) ?? { count: 0, likedByMe: false };
    return {
      id: c.id,
      content: c.content,
      authorName: c.author_name ?? "Anonyme",
      createdAt: c.created_at,
      likeCount: l.count,
      likedByMe: l.likedByMe,
    };
  });
}