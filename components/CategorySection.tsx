'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedArticles, PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { getCategoryLabelByLanguage, CategoryRecord } from "@/lib/categories";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { getPbFileUrl } from "@/lib/pbFiles";
import { localePath } from "@/lib/navigation";

interface CategorySectionProps {
    category: CategoryRecord;
    hideSidebar?: boolean;
}

const CategorySection = ({ category, hideSidebar = false }: CategorySectionProps) => {
    const { language, t } = useLanguage();
    const { items: allArticles } = usePublishedArticles();
    const pathname = usePathname();
    const locale = pathname.split('/')[1] || 'vi';

    // Filter articles by category
    const articles = useMemo(() => {
        return allArticles.filter((article) => {
            const catId = article.category || article.expand?.category?.id;
            const catSlug = article.expand?.category?.slug;
            return catId === category.id || catSlug === category.slug;
        });
    }, [allArticles, category.id, category.slug]);

    // Get most viewed articles for sidebar
    const sidebarArticles = useMemo(() => {
        return [...allArticles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 8);
    }, [allArticles]);

    const currentCategoryName = getCategoryLabelByLanguage(category, language);
    const viewAllText = t("viewMore") || (language === 'VN' ? "Xem thêm" : "もっと見る");
    const sidebarTitle = t("most_viewed_sidebar") || (language === 'VN' ? "Đọc nhiều" : "アクセスランキング");

    const featuredArticle = articles[0];
    const subArticles = articles.slice(1, 4);

    const getArticleTitle = (article: PublishedArticle) => {
        if (language === "JP") return article.title_jp || article.title_vi || "(Chưa có tiêu đề)";
        return article.title_vi || article.title_jp || "(Chưa có tiêu đề)";
    };

    const getArticleSummary = (article: PublishedArticle) => {
        if (language === "JP") return article.sapo_jp || article.sapo_vi || "";
        return article.sapo_vi || article.sapo_jp || "";
    };

    const getArticleLink = (article: PublishedArticle) => {
        return article.slug ? `/longform/${article.slug}` : `/longform/${article.id}`;
    };

    if (!featuredArticle) return null;

    return (
        <section className="py-6 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className={`grid grid-cols-1 ${hideSidebar ? 'lg:grid-cols-8' : 'lg:grid-cols-12'} gap-8`}>

                    {/* LEFT COLUMN: Main Articles */}
                    <div className={`${hideSidebar ? 'lg:col-span-8' : 'lg:col-span-8'}`}>
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-3">
                                <span
                                    className="inline-block w-2 h-8 rounded-sm"
                                    style={{
                                        background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
                                        transform: "skewX(-12deg)",
                                    }}
                                />
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {currentCategoryName}
                                </h2>
                            </div>
                            <Link href={localePath(locale, `/category/${category.slug}`)} className="text-sm font-medium text-black hover:text-[#7c3aed] flex items-center gap-1 group">
                                {viewAllText}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Featured Article */}
                        <div className="mb-10">
                            <Link href={localePath(locale, getArticleLink(featuredArticle))} className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                <div className="order-2 lg:order-1 md:col-span-5 space-y-3">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-[#7c3aed] transition-colors">
                                        {getArticleTitle(featuredArticle)}
                                    </h3>
                                    <p className="text-black text-base md:text-base leading-relaxed line-clamp-4">
                                        {getArticleSummary(featuredArticle)}
                                    </p>
                                </div>
                                <div className="order-1 lg:order-2 md:col-span-12 lg:col-span-7">
                                    <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-gray-100">
                                        <img
                                            src={getPbFileUrl(featuredArticle, featuredArticle.thumbnail) || featuredArticle.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                                            alt={getArticleTitle(featuredArticle)}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"; }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Grid of 3 Articles */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {subArticles.map((article) => (
                                <Link key={article.id} href={localePath(locale, getArticleLink(article))} className="group block">
                                    <div className="aspect-[16/9] w-full overflow-hidden rounded-sm bg-gray-100 mb-3">
                                        <img
                                            src={getPbFileUrl(article, article.thumbnail) || article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                                            alt={getArticleTitle(article)}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"; }}
                                        />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 leading-snug group-hover:text-[#7c3aed] transition-colors line-clamp-3">
                                        {getArticleTitle(article)}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Tin đọc nhiều */}
                    {!hideSidebar && (
                        <div className="lg:col-span-4 lg:pl-6 pt-12 lg:pt-0">
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
                                {sidebarArticles.map((article, index) => (
                                    <Link
                                        key={article.id}
                                        href={localePath(locale, getArticleLink(article))}
                                        className="group relative flex items-center justify-between py-4 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <div className="pr-12">
                                            <h4 className="text-sm font-medium text-black leading-snug group-hover:text-[#7c3aed] transition-colors line-clamp-2">
                                                {getArticleTitle(article)}
                                            </h4>
                                        </div>
                                        <span className="absolute right-0 text-5xl font-black text-gray-100 pointer-events-none group-hover:text-gray-200 transition-colors select-none">
                                            {index + 1}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default CategorySection;

