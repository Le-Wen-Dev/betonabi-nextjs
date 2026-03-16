import { useMemo } from "react";
import type { Article } from "@/data/mockData";
import CategoryBlock from "./CategoryBlock";
import { useCategories } from "@/contexts/CategoriesContext";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { getPbFileUrl } from "@/lib/pbFiles";

const CategoryGrid = () => {
  const { language, t } = useLanguage();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { items: published, loading: articlesLoading, error: articlesError } = usePublishedArticles();

  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
  const readTimeLabel = t("readTime");

  const categoryArticles = useMemo(() => {
    const items = (published as PublishedArticle[]) || [];
    const toMs = (a: PublishedArticle) => {
      const s = a.publishedAt || a.created;
      const ms = s ? Date.parse(s) : 0;
      return Number.isFinite(ms) ? ms : 0;
    };

    const mapPbToArticle = (a: PublishedArticle, categoryLabel: string): Article => {
      const title = language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");
      const summary = language === "JP" ? (a.sapo_jp || a.sapo_vi || "") : (a.sapo_vi || a.sapo_jp || "");
      const authorName = a.expand?.author?.name || a.expand?.author?.email || "Author";
      const dateStr = a.publishedAt || a.created || "";
      const date = dateStr ? new Date(dateStr).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN") : "";
      const mins = typeof a.readingMinutes === "number" ? a.readingMinutes : 0;
      const readTime =
        mins > 0 ? (language === "JP" ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : "";
      const image = getPbFileUrl(a, a.thumbnail) || "";
      return {
        id: a.slug || a.id,
        title: title || "(Untitled)",
        summary,
        category: categoryLabel,
        image,
        author: authorName,
        date,
        readTime,
      };
    };

    const byCategoryId = new Map<string, PublishedArticle[]>();
    for (const a of items) {
      const cid = a.expand?.category?.id || a.category;
      if (!cid) continue;
      const arr = byCategoryId.get(cid) || [];
      arr.push(a);
      byCategoryId.set(cid, arr);
    }

    const result = new Map<string, Article[]>();
    for (const c of categories) {
      const cid = c.id;
      const list = (byCategoryId.get(cid) || []).slice().sort((a, b) => toMs(b) - toMs(a));
      const label = getCategoryLabelByLanguage(c, language);
      result.set(cid, list.slice(0, 4).map((a) => mapPbToArticle(a, label)));
    }
    return result;
  }, [published, categories, language, readTimeLabel]);

  const displayCategories = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {(categoriesLoading || articlesLoading) && (
          <div className="text-sm text-muted-foreground italic mb-6">
            {no("Đang tải...", "読み込み中…")}
          </div>
        )}

        {categoriesError || articlesError ? (
          <div className="border border-border rounded-sm p-4 text-sm text-muted-foreground mb-6">
            {no("Không tải được dữ liệu.", "データを読み込めません。")}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.length ? (
            displayCategories.map((c) => (
              <CategoryBlock
                key={c.id}
                title={getCategoryLabelByLanguage(c, language)}
                slug={c.slug}
                articles={categoryArticles.get(c.id) || []}
              />
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic">
              {no("Không có danh mục.", "カテゴリがありません。")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
