'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";
import { getPbFileUrl } from "@/lib/pbFiles";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { localePath } from "@/lib/navigation";

const LongformSection = () => {
  const { language, t } = useLanguage();
  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
  const { items, loading: isLoading, error } = usePublishedArticles();
  const hasError = !!error;
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  // Get up to 3 longform articles
  const longformArticles = useMemo(() => {
    const longforms = (items as PublishedArticle[]).filter((a) => !!a.longform).slice(0, 3);
    return longforms.map((article) => {
      const title =
        language === "JP" ? (article.title_jp || article.title_vi) : (article.title_vi || article.title_jp);
      const summary =
        language === "JP" ? (article.sapo_jp || article.sapo_vi) : (article.sapo_vi || article.sapo_jp);
      const image = getPbFileUrl(article, article.thumbnail) || "";
      return {
        id: article.slug || article.id,
        title: title || "",
        summary: summary || "",
        image,
      };
    });
  }, [items, language]);

  const mainArticle = longformArticles[0] || null;
  const sideArticles = longformArticles.slice(1, 3);

  return (
    <section className="py-8 my-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="border-[6px] border-[#7c3aed]/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#7c3aed]/5 bg-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4d0078]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-10 rounded-sm"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
                  transform: "skewX(-15deg)",
                }}
              />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{no("Longform", "特集")}</h2>
            </div>
          </div>

          {/* Content Grid */}
          {mainArticle ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
              {/* 1. Featured Article (Left - 8/12) */}
              <div className="lg:col-span-8">
                <Link href={localePath(locale, `/longform/${mainArticle.id}`)} className="group block">
                  <div className="relative aspect-[16/9] overflow-hidden mb-8 rounded-xl shadow-md">
                    <img
                      src={mainArticle.image || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                      alt={mainArticle.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-[#7c3aed] text-white p-3 rounded-full shadow-lg block transform transition-transform group-hover:scale-110">
                        <Camera className="w-6 h-6" />
                      </span>
                    </div>
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-[1.2] group-hover:text-[#7c3aed] transition-colors">
                    {mainArticle.title}
                  </h3>
                  <p className="text-black text-base md:text-base leading-relaxed line-clamp-3 font-medium opacity-90">
                    {mainArticle.summary}
                  </p>
                </Link>
              </div>

              {/* 2. Side Articles (Right - 4/12) */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {sideArticles.map((article) => (
                  <Link key={article.id} href={localePath(locale, `/longform/${article.id}`)} className="group block">
                    <div className="relative aspect-video overflow-hidden mb-5 rounded-lg shadow-sm">
                      <img
                        src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 backdrop-blur-md text-white p-2 rounded-md block">
                          <FileText className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 leading-snug group-hover:text-[#7c3aed] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                  </Link>
                ))}
                {/* Fill empty slots if less than 2 side articles */}
                {sideArticles.length < 2 && (
                  <div className="text-sm text-muted-foreground italic">
                    {no("Chưa có thêm bài longform", "他の特集記事がありません")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-sm p-6 text-sm text-muted-foreground text-center relative z-10">
              {isLoading
                ? no("Đang tải...", "読み込み中…")
                : hasError
                  ? no("Không tải được dữ liệu.", "データを読み込めません。")
                  : no("Không có dữ liệu longform", "特集記事がありません。")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LongformSection;
