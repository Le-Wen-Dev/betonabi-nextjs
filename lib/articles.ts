import { pb } from "@/lib/pb";

export const ARTICLES_COLLECTION = "articles";

export type ArticleStatus = "draft" | "pending" | "published" | "rejected" | "scheduled";

export type ArticleRecord = {
  id: string;
  created: string;
  updated: string;

  slug?: string; // unique, used for public URLs

  title_vi?: string;
  sapo_vi?: string;
  content_vi?: string;

  title_jp?: string;
  sapo_jp?: string;
  content_jp?: string;

  category?: string; // relation id (categories)
  author?: string; // relation id (users)

  status?: ArticleStatus;
  publishedAt?: string; // datetime

  tags?: string[]; // json array
  location?: string; // text
  thumbnail?: string; // file name
  views?: number; // number
  readingMinutes?: number; // number
  featured?: boolean; // bool (hero/sub-hero)
  editorsPick?: boolean; // bool (right column)
  longform?: boolean; // bool (E-magazine section)

  approvedAt?: string; // datetime
  approvedBy?: string; // relation id (users)
  rejectedAt?: string; // datetime
  rejectedBy?: string; // relation id (users)
  rejectedReason?: string; // text

  // SEO fields
  seo_title_vi?: string;
  seo_title_jp?: string;
  seo_description_vi?: string;
  seo_description_jp?: string;
  seo_keyphrase_vi?: string;
  seo_keyphrase_jp?: string;
  og_image?: string; // file name
  canonical_url?: string;
  noindex?: string; // plain text "true"/"false" in PocketBase

  expand?: Record<string, unknown>;
};

export type ListArticlesParams = {
  page: number;
  perPage: number;
  search?: string;
  status?: "all" | ArticleStatus;
  categoryId?: string | "all";
  authorId?: string; // if set, filter by author
};

function escapePbFilterValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function listArticles(params: ListArticlesParams) {
  const filters: string[] = [];

  if (params.authorId) {
    const authorEsc = escapePbFilterValue(params.authorId);
    filters.push(`author = "${authorEsc}"`);
  }

  if (params.status && params.status !== "all") {
    const statusEsc = escapePbFilterValue(params.status);
    filters.push(`status = "${statusEsc}"`);
  }

  if (params.categoryId && params.categoryId !== "all") {
    const catEsc = escapePbFilterValue(params.categoryId);
    filters.push(`category = "${catEsc}"`);
  }

  if (params.search && params.search.trim()) {
    const q = escapePbFilterValue(params.search.trim());
    // search across vi/jp titles + sapo
    filters.push(
      `(title_vi ~ "${q}" || title_jp ~ "${q}" || sapo_vi ~ "${q}" || sapo_jp ~ "${q}")`
    );
  }

  const filter = filters.length ? filters.join(" && ") : undefined;

  // prefer sorting by publishedAt desc, fallback to created desc if field missing on server
  try {
    return await pb
      .collection(ARTICLES_COLLECTION)
      .getList<ArticleRecord>(params.page, params.perPage, {
        filter,
        sort: "-featured,-publishedAt",
        expand: "author,category",
      });
  } catch {
    return await pb
      .collection(ARTICLES_COLLECTION)
      .getList<ArticleRecord>(params.page, params.perPage, {
        filter,
        sort: "-created",
        expand: "author,category",
      });
  }
}

export async function getArticle(id: string) {
  return await pb.collection(ARTICLES_COLLECTION).getOne<ArticleRecord>(id, {
    expand: "author,category",
  });
}

export async function getArticleBySlug(slug: string) {
  const esc = slug.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const res = await pb.collection(ARTICLES_COLLECTION).getList<ArticleRecord>(1, 1, {
    filter: `slug = "${esc}"`,
    expand: "author,category",
  });
  return res.items?.[0] ?? null;
}

export async function getUniqueArticleSlug(baseSlug: string, excludeId?: string) {
  const base = baseSlug.trim();
  if (!base) return "";

  const exclude = excludeId
    ? ` && id != "${excludeId.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    : "";

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const esc = candidate.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const res = await pb.collection(ARTICLES_COLLECTION).getList<ArticleRecord>(1, 1, {
      filter: `slug = "${esc}"${exclude}`,
    });
    if (!res.items || res.items.length === 0) return candidate;
  }

  throw new Error("Slug đã tồn tại. Vui lòng thử slug khác.");
}

export type UpsertArticleInput = {
  slug: string;
  title_vi: string;
  sapo_vi: string;
  content_vi: string;
  title_jp: string;
  sapo_jp: string;
  content_jp: string;
  category: string; // category id (backward compat)
  categories?: string[]; // multiple category ids
  author: string; // user id
  status: ArticleStatus;
  publishedAt?: string;
  tags?: string[];
  location?: string;
  readingMinutes?: number;
  featured?: boolean;
  editorsPick?: boolean;
  longform?: boolean;
  thumbnailFile?: File | null;
  // SEO
  seo_title_vi?: string;
  seo_title_jp?: string;
  seo_description_vi?: string;
  seo_description_jp?: string;
  seo_keyphrase_vi?: string;
  seo_keyphrase_jp?: string;
  ogImageFile?: File | null;
  canonical_url?: string;
  noindex?: boolean;
};

function toFormData(input: UpsertArticleInput) {
  const fd = new FormData();
  fd.set("slug", input.slug);
  fd.set("title_vi", input.title_vi);
  fd.set("sapo_vi", input.sapo_vi);
  fd.set("content_vi", input.content_vi);
  fd.set("title_jp", input.title_jp);
  fd.set("sapo_jp", input.sapo_jp);
  fd.set("content_jp", input.content_jp);
  // Handle multiple categories
  if (Array.isArray(input.categories) && input.categories.length > 0) {
    input.categories.forEach((catId) => {
      fd.append("categories", catId);
    });
  }
  fd.set("author", input.author);
  fd.set("status", input.status);
  if (input.publishedAt) fd.set("publishedAt", input.publishedAt);
  if (Array.isArray(input.tags) && input.tags.length > 0) fd.set("tags", JSON.stringify(input.tags));
  if (typeof input.location === "string" && input.location.trim()) fd.set("location", input.location);
  if (typeof input.readingMinutes === "number")
    fd.set("readingMinutes", String(input.readingMinutes));
  if (typeof input.featured === "boolean")
    fd.set("featured", input.featured ? "true" : "false");
  if (typeof input.editorsPick === "boolean")
    fd.set("editorsPick", input.editorsPick ? "true" : "false");
  if (typeof input.longform === "boolean")
    fd.set("longform", input.longform ? "true" : "false");
  if (input.thumbnailFile) fd.set("thumbnail", input.thumbnailFile);
  // SEO fields
  if (input.seo_title_vi != null) fd.set("seo_title_vi", input.seo_title_vi);
  if (input.seo_title_jp != null) fd.set("seo_title_jp", input.seo_title_jp);
  if (input.seo_description_vi != null) fd.set("seo_description_vi", input.seo_description_vi);
  if (input.seo_description_jp != null) fd.set("seo_description_jp", input.seo_description_jp);
  if (input.seo_keyphrase_vi != null) fd.set("seo_keyphrase_vi", input.seo_keyphrase_vi);
  if (input.seo_keyphrase_jp != null) fd.set("seo_keyphrase_jp", input.seo_keyphrase_jp);
  if (input.ogImageFile) fd.set("og_image", input.ogImageFile);
  if (input.canonical_url != null) fd.set("canonical_url", input.canonical_url);
  if (input.noindex != null) fd.set("noindex", input.noindex ? "true" : "false");
  return fd;
}

export async function createArticle(input: UpsertArticleInput) {
  const fd = toFormData(input);
  return await pb.collection(ARTICLES_COLLECTION).create<ArticleRecord>(fd);
}

export async function updateArticle(id: string, input: UpsertArticleInput) {
  const fd = toFormData(input);
  return await pb.collection(ARTICLES_COLLECTION).update<ArticleRecord>(id, fd);
}

export async function deleteArticle(id: string) {
  return await pb.collection(ARTICLES_COLLECTION).delete(id);
}

export async function ensureFeaturedLimit(params: {
  keepIds: string[];
  limit: number;
  field?: "featured" | "editorsPick" | "longform";
}) {
  // Best-effort client-side enforcement. Recommended: do this in pb_hooks.
  const keep = Array.from(new Set(params.keepIds.filter(Boolean)));
  const limit = Math.max(0, Math.floor(params.limit));
  if (limit === 0) return;
  if (keep.length > limit) keep.length = limit;
  const field = params.field || "featured";

  const keepFilter = keep
    .map((id) => `id != "${id.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(" && ");

  const filter = keepFilter
    ? `${field} = true && ${keepFilter}`
    : `${field} = true`;
  const res = await pb
    .collection(ARTICLES_COLLECTION)
    .getList<ArticleRecord>(1, 200, {
      filter,
      sort: "-publishedAt,-updated",
    });

  const allowedOthers = Math.max(0, limit - keep.length);
  const toUnfeature = res.items.slice(allowedOthers);
  await Promise.all(
    toUnfeature.map((r) =>
      pb.collection(ARTICLES_COLLECTION).update(r.id, { [field]: false })
    )
  );
}

export async function approveArticle(id: string, adminUserId: string) {
  const now = new Date().toISOString();
  return await pb.collection(ARTICLES_COLLECTION).update<ArticleRecord>(id, {
    status: "published",
    publishedAt: now,
    approvedAt: now,
    approvedBy: adminUserId,
  });
}

export async function rejectArticle(
  id: string,
  adminUserId: string,
  reason?: string
) {
  const now = new Date().toISOString();
  return await pb.collection(ARTICLES_COLLECTION).update<ArticleRecord>(id, {
    status: "rejected",
    rejectedAt: now,
    rejectedBy: adminUserId,
    rejectedReason: typeof reason === "string" ? reason : "",
  });
}

export async function incrementArticleViews(id: string) {
  // PocketBase supports "field+" modifier to increment number fields.
  // If server/rules don't allow, this should fail silently in the caller.
  return await pb
    .collection(ARTICLES_COLLECTION)
    .update<ArticleRecord>(id, { "views+": 1 } as any);
}

/**
 * Auto-publish scheduled articles whose publishedAt <= now.
 * Returns the list of article IDs that were published.
 */
export async function publishScheduledArticles(): Promise<string[]> {
  try {
    const now = new Date().toISOString().replace("T", " ");
    const res = await pb
      .collection(ARTICLES_COLLECTION)
      .getList<ArticleRecord>(1, 50, {
        filter: `status = "scheduled" && publishedAt <= "${now}"`,
        sort: "-publishedAt",
      });

    if (!res.items || res.items.length === 0) return [];

    const publishedIds: string[] = [];
    await Promise.all(
      res.items.map(async (article) => {
        try {
          await pb.collection(ARTICLES_COLLECTION).update(article.id, {
            status: "published",
          });
          publishedIds.push(article.id);
        } catch {
          // Fail silently for individual articles
        }
      })
    );

    return publishedIds;
  } catch {
    return [];
  }
}
