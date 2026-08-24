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

export interface ForumReplyItem {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface ForumTopicDetail {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  replies: ForumReplyItem[];
}

export async function getForumTopicDetail(id: string, currentUserId: string | null): Promise<ForumTopicDetail | null> {
  const supabase = await createClient();

  const { data: topic, error } = await supabase
    .from("forum_topics")
    .select("id, title, content, author_name, created_at")
    .eq("id", id)
    .single();

  if (error || !topic) return null;

  const { data: replies } = await supabase
    .from("forum_replies")
    .select("id, content, author_name, created_at")
    .eq("topic_id", id)
    .order("created_at", { ascending: true });

  const replyIds = (replies ?? []).map((r) => r.id);
  const allTargetIds = [id, ...replyIds];

  const { data: likes } = await supabase.from("forum_likes").select("target_id, user_id").in("target_id", allTargetIds);

  const likesByTarget = new Map<string, { count: number; likedByMe: boolean }>();
  for (const like of likes ?? []) {
    const entry = likesByTarget.get(like.target_id) ?? { count: 0, likedByMe: false };
    entry.count += 1;
    if (currentUserId && like.user_id === currentUserId) entry.likedByMe = true;
    likesByTarget.set(like.target_id, entry);
  }

  const topicLikes = likesByTarget.get(id) ?? { count: 0, likedByMe: false };

  return {
    id: topic.id,
    title: topic.title,
    content: topic.content,
    authorName: topic.author_name ?? "Anonyme",
    createdAt: topic.created_at,
    likeCount: topicLikes.count,
    likedByMe: topicLikes.likedByMe,
    replies: (replies ?? []).map((r) => {
      const l = likesByTarget.get(r.id) ?? { count: 0, likedByMe: false };
      return {
        id: r.id,
        content: r.content,
        authorName: r.author_name ?? "Anonyme",
        createdAt: r.created_at,
        likeCount: l.count,
        likedByMe: l.likedByMe,
      };
    }),
  };
}