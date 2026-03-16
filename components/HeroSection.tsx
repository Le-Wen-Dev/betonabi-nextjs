'use client';

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPbFileUrl } from "@/lib/pbFiles";
import type { Article } from "@/data/mockData";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { localePath } from "@/lib/navigation";

const HeroSection = () => {
  const { language } = useLanguage();
  const { items: publishedArticles, loading: isLoading, error } = usePublishedArticles();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
  const hasError = !!error;

  const pbSortedByTime = useMemo(() => {
    const items = publishedArticles || [];
    const toMs = (a: PublishedArticle) => {
      const s = a.publishedAt || a.created;
      const ms = s ? Date.parse(s) : 0;
      return Number.isFinite(ms) ? ms : 0;
    };
    return [...items].sort((a, b) => toMs(b) - toMs(a));
  }, [publishedArticles]);

  const mapPbToArticle = useCallback((a: PublishedArticle): Article => {
    const title =
      language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");
    const summary =
      language === "JP" ? (a.sapo_jp || a.sapo_vi || "") : (a.sapo_vi || a.sapo_jp || "");
    const categoryName =
      language === "JP"
        ? (a.expand?.category?.name_jp ||
          a.expand?.category?.name_vi ||
          a.expand?.category?.name ||
          a.expand?.category?.slug)
        : (a.expand?.category?.name_vi ||
          a.expand?.category?.name_jp ||
          a.expand?.category?.name ||
          a.expand?.category?.slug);
    const image = getPbFileUrl(a, a.thumbnail) || "";
    return {
      id: a.slug || a.id,
      title: title || "(Untitled)",
      summary,
      category: categoryName || (a.category || "Category"),
      image,
      author: "",
      date: "",
      readTime: "",
    };
  }, [language]);

  // Main featured article (always show newest article first)
  const featuredHero = useMemo(() => {
    if (pbSortedByTime.length > 0) return mapPbToArticle(pbSortedByTime[0]);
    return null;
  }, [pbSortedByTime, mapPbToArticle]);

  // Right side articles (exclude the main featured) - get 4 for the new layout
  const rightSideArticles = useMemo(() => {
    const mainId = featuredHero?.id;
    const filtered = pbSortedByTime.filter((a) => {
      const id = a.slug || a.id;
      return id !== mainId && !a.longform;
    });
    return filtered.slice(0, 4).map(mapPbToArticle);
  }, [pbSortedByTime, featuredHero, mapPbToArticle]);

  return (
    <section className="pt-4 pb-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Feature (50%) */}
          <div className="lg:col-span-6 space-y-3">
            {featuredHero ? (
              <Link href={localePath(locale, `/longform/${featuredHero.id}`)} className="group block">
                <div className="aspect-[16/9] overflow-hidden mb-3 rounded-lg">
                  <img
                    src={featuredHero.image || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                    alt={featuredHero.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="newspaper-heading text-2xl sm:text-3xl font-bold group-hover:text-[#4d0078] transition-colors leading-tight">
                    {featuredHero.title}
                  </h2>
                  <p className="newspaper-body text-black text-base leading-snug line-clamp-3">
                    {featuredHero.summary}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="border border-border rounded-sm p-4 text-sm text-muted-foreground">
                {isLoading
                  ? no("Đang tải bài viết...", "読み込み中…")
                  : hasError
                    ? no("Không tải được dữ liệu.", "データを読み込めません。")
                    : no("Không có dữ liệu", "記事がありません。")}
              </div>
            )}
          </div>

          {/* Right Column - Side List (50%) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            {rightSideArticles.map((article, index) => (
              <div key={article.id}>
                <Link href={localePath(locale, `/longform/${article.id}`)} className="group grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-8 space-y-1">
                    <h3 className="font-bold text-base leading-normal group-hover:text-[#4d0078] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  <div className="col-span-4">
                    <div className="aspect-[3/2] overflow-hidden rounded bg-gray-200">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-[10px]">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                {index < rightSideArticles.length - 1 && <Separator className="my-2" />}
              </div>
            ))}

            {/* Empty state */}
            {rightSideArticles.length === 0 && (
              <div className="text-sm text-muted-foreground italic">
                {isLoading
                  ? no("Đang tải...", "読み込み中…")
                  : no("Không có bài viết.", "記事がありません。")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
