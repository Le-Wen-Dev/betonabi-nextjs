import { pb } from "@/lib/pb";

export const COMMENTS_COLLECTION = "comments";

export type CommentRecord = {
  id: string;
  created?: string;
  updated?: string;

  article: string; // relation id
  user: string; // relation id
  parent?: string; // relation id (comments) or ""
  content: string;

  expand?: {
    user?: { id?: string; name?: string; email?: string };
    article?: {
      id?: string;
      slug?: string;
      title_vi?: string;
      title_jp?: string;
      title?: string;
    };
  };
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function listTopLevelComments(params: {
  articleId: string;
  page: number;
  perPage: number;
}) {
  const a = escapePbFilterValue(params.articleId);
  // parent is optional relation; empty is stored as "".
  const filter = `article = "${a}" && parent = ""`;
  return await pb
    .collection(COMMENTS_COLLECTION)
    .getList<CommentRecord>(params.page, params.perPage, {
      filter,
      expand: "user",
    });
}

export async function listReplies(params: {
  articleId: string;
  parentId: string;
  page: number;
  perPage: number;
}) {
  const a = escapePbFilterValue(params.articleId);
  const p = escapePbFilterValue(params.parentId);
  const filter = `article = "${a}" && parent = "${p}"`;
  return await pb
    .collection(COMMENTS_COLLECTION)
    .getList<CommentRecord>(params.page, params.perPage, {
      filter,
      expand: "user",
    });
}

export async function createComment(params: {
  articleId: string;
  userId: string;
  content: string;
  parentId?: string;
}) {
  if (!params.articleId?.trim()) throw new Error("Article ID required");
  if (!params.userId?.trim()) throw new Error("User ID required");
  if (!params.content?.trim()) throw new Error("Content required");
  if (params.content.trim().length > 5000) throw new Error("Content too long (max 5000 chars)");

  const payload: Record<string, unknown> = {
    article: params.articleId,
    user: params.userId,
    content: params.content.trim(),
  };
  if (params.parentId) payload.parent = params.parentId;
  return await pb
    .collection(COMMENTS_COLLECTION)
    .create<CommentRecord>(payload, { expand: "user" });
}

export async function countUserComments(params: { userId: string }) {
  const u = escapePbFilterValue(params.userId);
  const res = await pb
    .collection(COMMENTS_COLLECTION)
    .getList<CommentRecord>(1, 1, {
      filter: `user = "${u}"`,
    });
  return res.totalItems ?? 0;
}

export async function listUserComments(params: {
  userId: string;
  page: number;
  perPage: number;
}) {
  const u = escapePbFilterValue(params.userId);
  try {
    return await pb
      .collection(COMMENTS_COLLECTION)
      .getList<CommentRecord>(params.page, params.perPage, {
        filter: `user = "${u}"`,
        sort: "-created",
        expand: "article",
      });
  } catch {
    return await pb
      .collection(COMMENTS_COLLECTION)
      .getList<CommentRecord>(params.page, params.perPage, {
        filter: `user = "${u}"`,
        expand: "article",
      });
  }
}

// ─── Admin functions ────────────────────────────────────────────────

/**
 * List all comments (admin). Supports search by content and optional article filter.
 */
export async function listAllComments(params: {
  page: number;
  perPage: number;
  search?: string;
  articleId?: string;
}) {
  const parts: string[] = [];

  if (params.search) {
    const s = escapePbFilterValue(params.search);
    parts.push(`content ~ "${s}"`);
  }

  if (params.articleId) {
    const a = escapePbFilterValue(params.articleId);
    parts.push(`article = "${a}"`);
  }

  const filter = parts.join(" && ");

  try {
    return await pb
      .collection(COMMENTS_COLLECTION)
      .getList<CommentRecord>(params.page, params.perPage, {
        filter: filter || undefined,
        sort: "-created",
        expand: "user,article",
      });
  } catch {
    // Fallback without sort (some PB versions)
    return await pb
      .collection(COMMENTS_COLLECTION)
      .getList<CommentRecord>(params.page, params.perPage, {
        filter: filter || undefined,
        expand: "user,article",
      });
  }
}

/**
 * Delete a comment by id (admin).
 */
export async function deleteComment(id: string) {
  return await pb.collection(COMMENTS_COLLECTION).delete(id);
}

/**
 * Delete multiple comments by ids (admin).
 */
export async function deleteComments(ids: string[]) {
  const results = await Promise.allSettled(
    ids.map((id) => pb.collection(COMMENTS_COLLECTION).delete(id))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  return { total: ids.length, deleted: ids.length - failed, failed };
}
