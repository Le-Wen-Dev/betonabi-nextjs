import { pb } from "@/lib/pb";

export const CATEGORIES_COLLECTION = "categories";

export type CategoryRecord = {
  id: string;
  slug: string;
  name_vi?: string;
  name_jp?: string;
  name?: string;
  description_vi?: string;
  description_jp?: string;
  description?: string;
  created?: string;
  updated?: string;
};

export async function listCategories(limit = 200) {
  // Some older PocketBase deployments/proxies return 400 on certain query params (eg. sort).
  // Keep the request minimal and sort client-side.
  const safeLimit = Math.min(Math.max(1, limit), 50);
  return await pb
    .collection(CATEGORIES_COLLECTION)
    .getList<CategoryRecord>(1, safeLimit);
}

export function sortCategoriesByLanguage(
  categories: CategoryRecord[],
  language: "VN" | "JP"
) {
  const copy = [...categories];
  copy.sort((a, b) =>
    getCategoryLabelByLanguage(a, language).localeCompare(
      getCategoryLabelByLanguage(b, language),
      language === "JP" ? "ja" : "vi"
    )
  );
  return copy;
}

// Fallback JP labels for common slugs when name_jp is missing in DB
const SLUG_JP_FALLBACK: Record<string, string> = {
  "moi-nhat": "新着",
  "doc-nhieu": "ランキング",
  "van-hoa": "文化",
  "kinh-doanh": "ビジネス",
  "doi-song": "ライフ",
  "du-lich": "旅行",
  "suc-khoe": "健康",
  "longform": "特集",
  "long-form": "特集",
  "giao-duc": "教育",
  "xa-hoi": "社会",
};

export function getCategoryLabelByLanguage(
  c: CategoryRecord,
  language: "VN" | "JP"
) {
  if (language === "JP") return c.name_jp || SLUG_JP_FALLBACK[c.slug] || c.name_vi || c.name || c.slug;
  return c.name_vi || c.name_jp || c.name || c.slug;
}
