import Link from "next/link";
import type { CommentItem } from "@/lib/queries-social";
import { toggleLike } from "@/lib/actions-social";

export default function CommentsSection({
  comments,
  isLoggedIn,
  action,
  revalidateTargetPath,
}: {
  comments: CommentItem[];
  isLoggedIn: boolean;
  action: (formData: FormData) => Promise<void>;
  revalidateTargetPath: string;
}) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl tracking-wide mb-4">
        {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
      </h2>

      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-surface border border-white/10 rounded-lg p-4">
              <p className="text-sand whitespace-pre-line mb-2">{c.content}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">
                  {c.authorName} · {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <form action={toggleLike.bind(null, "comment", c.id, revalidateTargetPath)}>
                  <button
                    type="submit"
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      c.likedByMe ? "bg-gold text-night border-gold" : "border-white/10 text-muted hover:border-gold/50"
                    }`}
                  >
                    👍 {c.likeCount}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form action={action} className="bg-surface border border-white/10 rounded-lg p-4 space-y-3">
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Ton commentaire..."
            className="w-full bg-night border border-white/10 rounded-lg px-3 py-2 text-sand placeholder:text-muted"
          />
          <button
            type="submit"
            className="w-full bg-gold text-night font-semibold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
          >
            Publier
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/communaute/connexion" className="text-gold hover:underline">
            Connecte-toi
          </Link>{" "}
          pour commenter.
        </p>
      )}
    </div>
  );
}