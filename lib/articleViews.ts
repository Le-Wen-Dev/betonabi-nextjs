import { pb } from "@/lib/pb";
import { incrementArticleViews } from "@/lib/articles";

export const ARTICLE_VIEWS_COLLECTION = "article_views";

export async function createArticleView(params: {
  key: string;
  articleId: string;
}) {
  // Prefer server-side view tracking via article_views + pb_hooks.
  // If the collection doesn't exist / is blocked, fallback to direct increment (may be blocked by rules).
  try {
    return await pb.collection(ARTICLE_VIEWS_COLLECTION).create({
      key: params.key,
      article: params.articleId,
    });
  } catch {
    // fallback best-effort
    try {
      await incrementArticleViews(params.articleId);
    } catch {
      // ignore
    }
    return null;
  }
}
