'use client';

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { localePath } from "@/lib/navigation";

const CategorySidebar = () => {
  const { language, t } = useLanguage();
  const { items, loading, error } = usePublishedArticles();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);

  const sidebarTitle = t("most_viewed_sidebar") || no("Đọc nhiều", "アクセスランキング");

  const sidebarArticles = useMemo(() => {
    return [...(items as PublishedArticle[])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8);
  }, [items]);

  const getTitle = (a: PublishedArticle) =>
    language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");

  const getLink = (a: PublishedArticle) =>
    a.slug ? `/longform/${a.slug}` : `/longform/${a.id}`;

  return (
    <div className="space-y-12">
      {/* Most Viewed Widget (Tin Đọc Nhiều) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-block w-2.5 h-7 rounded-sm"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
              transform: "skewX(-15deg)",
            }}
          />
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {sidebarTitle}
          </h3>
        </div>

        <div className="space-y-0 divide-y divide-gray-100">
          {sidebarArticles.length > 0 ? (
            sidebarArticles.map((article, index) => (
              <Link
                href={localePath(locale, getLink(article))}
                key={article.id}
                className="group relative flex items-center justify-between py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="pr-12">
                  <h4 className="text-sm font-medium text-black leading-snug group-hover:text-[#7c3aed] transition-colors line-clamp-2">
                    {getTitle(article) || "(Untitled)"}
                  </h4>
                </div>
                <span className="absolute right-0 text-5xl font-black text-gray-100 pointer-events-none group-hover:text-[#7c3aed] transition-colors select-none">
                  {index + 1}
                </span>
              </Link>
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic py-4">
              {loading
                ? no("Đang tải...", "読み込み中…")
                : error
                  ? no("Không tải được.", "読み込めません。")
                  : no("Không có bài viết.", "記事がありません。")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
