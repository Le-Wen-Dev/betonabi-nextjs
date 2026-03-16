import { pb } from "@/lib/pb";

export const SAVED_ARTICLES_COLLECTION = "saved_articles";

export type SavedArticleRecord = {
  id: string;
  created?: string;
  updated?: string;
  user: string; // relation id (users)
  article: string; // relation id (articles)
  expand?: {
    article?: {
      id: string;
      slug?: string;
      title_vi?: string;
      title_jp?: string;
      sapo_vi?: string;
      sapo_jp?: string;
      publishedAt?: string;
      created?: string;
      thumbnail?: string;
      readingMinutes?: number;
      category?: string;
      expand?: {
        category?: {
          slug?: string;
          name_vi?: string;
          name_jp?: string;
          name?: string;
        };
      };
    };
  };
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function isArticleSaved(params: {
  userId: string;
  articleId: string;
}) {
  const u = escapePbFilterValue(params.userId);
  const a = escapePbFilterValue(params.articleId);
  const res = await pb
    .collection(SAVED_ARTICLES_COLLECTION)
    .getList<SavedArticleRecord>(1, 1, {
      filter: `user = "${u}" && article = "${a}"`,
    });
  return !!res.items?.[0];
}

export async function saveArticle(params: {
  userId: string;
  articleId: string;
}) {
  // best-effort dedupe
  const u = escapePbFilterValue(params.userId);
  const a = escapePbFilterValue(params.articleId);
  const existing = await pb
    .collection(SAVED_ARTICLES_COLLECTION)
    .getList<SavedArticleRecord>(1, 1, {
      filter: `user = "${u}" && article = "${a}"`,
    });
  if (existing.items?.[0]) return existing.items[0];
  return await pb
    .collection(SAVED_ARTICLES_COLLECTION)
    .create<SavedArticleRecord>({
      user: params.userId,
      article: params.articleId,
    });
}

export async function unsaveArticle(params: {
  userId: string;
  articleId: string;
}) {
  const u = escapePbFilterValue(params.userId);
  const a = escapePbFilterValue(params.articleId);
  const existing = await pb
    .collection(SAVED_ARTICLES_COLLECTION)
    .getList<SavedArticleRecord>(1, 50, {
      filter: `user = "${u}" && article = "${a}"`,
    });
  await Promise.all(
    (existing.items || []).map((x) =>
      pb.collection(SAVED_ARTICLES_COLLECTION).delete(x.id)
    )
  );
  return true;
}

export async function countSavedArticles(params: { userId: string }) {
  const u = escapePbFilterValue(params.userId);
  const res = await pb
    .collection(SAVED_ARTICLES_COLLECTION)
    .getList<SavedArticleRecord>(1, 1, {
      filter: `user = "${u}"`,
    });
  return res.totalItems ?? 0;
}

export async function listSavedArticles(params: {
  userId: string;
  page: number;
  perPage: number;
}) {
  const u = escapePbFilterValue(params.userId);
  try {
    return await pb
      .collection(SAVED_ARTICLES_COLLECTION)
      .getList<SavedArticleRecord>(params.page, params.perPage, {
        filter: `user = "${u}"`,
        sort: "-created",
        expand: "article",
      });
  } catch {
    return await pb
      .collection(SAVED_ARTICLES_COLLECTION)
      .getList<SavedArticleRecord>(params.page, params.perPage, {
        filter: `user = "${u}"`,
        expand: "article",
      });
  }
}
