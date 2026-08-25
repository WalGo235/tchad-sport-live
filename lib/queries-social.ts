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