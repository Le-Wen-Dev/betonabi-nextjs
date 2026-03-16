import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import CategorySidebar from "@/components/CategorySidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/contexts/CategoriesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { pb } from "@/lib/pb";
import { getPbFileUrl } from "@/lib/pbFiles";
import type { Article } from "@/data/mockData";
import { getArticlesByCategory } from "@/data/mockData";
import {
  categoryDataJP, latestNewsJP, recommendedArticlesJP,
  editorsPickJP, heroArticleJP, subHeroArticlesJP,
  lifestyleArticlesJP, longformArticlesJP,
} from "@/data/mockDataJP";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";

const ITEMS_PER_PAGE = 10;
const LONGFORM_ITEMS_PER_PAGE = 12;

// Build a flat lookup map of all JP articles by id (once)
const jpLookup: Record<string, Article> = {};
[heroArticleJP, ...subHeroArticlesJP, ...latestNewsJP, ...recommendedArticlesJP,
 ...editorsPickJP, ...lifestyleArticlesJP, ...longformArticlesJP,
 ...Object.values(categoryDataJP).flat()
].forEach((a) => { if (a?.id) jpLookup[a.id] = a; });

/** Translate an array of VN mock articles to JP where possible */
function translateMockArticles(articles: Article[], lang: string): Article[] {
  if (lang !== "JP") return articles;
  return articles.map((a) => {
    // Strip generated id suffix to find original id
    const baseId = a.id.replace(/-gen-\d+-\d+$/, "");
    const jp = jpLookup[baseId];
    if (!jp) return a;
    const isGenerated = a.id !== baseId;
    return {
      ...a,
      title: isGenerated && a.title.startsWith("[Tin cũ")
        ? a.title.replace(/^\[Tin cũ (\d+)\] .*$/, `[過去記事 $1] ${jp.title}`)
        : jp.title,
      summary: jp.summary,
    };
  });
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { language, t } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();

  const { items: publishedItems } = usePublishedArticles();

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  const reqIdRef = useRef(0);

  const category = useMemo(() => {
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [categories, slug]);

  // Check if this is the longform category (support multiple variations)
  const isLongform = useMemo(() => {
    if (!slug) return false;
    const normalized = slug.toLowerCase().replace(/\s+/g, '');
    return normalized === 'longform' || normalized === 'long-form';
  }, [slug]);

  const categoryName = useMemo(() => {
    if (!category) return "";
    if (language === "JP") return category.name_jp || category.name_vi || category.name || category.slug;
    return category.name_vi || category.name_jp || category.name || category.slug;
  }, [category, language]);

  // Get static articles matching this category (by categories array)
  const staticArticlesForCategory = useMemo(() => {
    if (!category) return [];
    const readTimeLabel = language === "JP" ? "分" : "phút đọc";
    return (publishedItems as PublishedArticle[])
      .filter((a) => {
        // Match by categories array
        const matchesCategories = Array.isArray((a as { categories?: string[] }).categories) &&
          (a as { categories?: string[] }).categories?.includes(category.id);

        return a.id.startsWith("static-") && matchesCategories;
      })
      .map((a): Article => {
        const title =
          language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");
        const summary =
          language === "JP" ? (a.sapo_jp || a.sapo_vi || "") : (a.sapo_vi || a.sapo_jp || "");
        const dateStr = a.publishedAt || a.created || "";
        const date = dateStr ? new Date(dateStr).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN") : "";
        const mins = typeof a.readingMinutes === "number" ? a.readingMinutes : 0;
        const readTime = mins > 0 ? (language === "JP" ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : "";
        const image = a.thumbnail || "";
        return {
          id: a.slug || a.id,
          title: title || "(Untitled)",
          summary,
          category: categoryName,
          image,
          author: a.expand?.author?.name || "",
          date,
          readTime,
        };
      });
  }, [category, publishedItems, language, categoryName]);

  // Get mock articles for this category from mockData
  const mockArticlesForCategory = useMemo(() => {
    if (!category) return [];
    // Map category slug/name to mockData keys
    const categoryMappings: Record<string, string> = {
      'moi-nhat': 'Mới nhất',
      'doc-nhieu': 'Đọc nhiều',
      'kinh-doanh': 'Kinh doanh',
      'xa-hoi': 'Xã hội',
      'doi-song': 'Đời sống',
      'du-lich': 'Du lịch',
      'van-hoa': 'Văn hóa',
      'giao-duc': 'Giáo dục',
      'suc-khoe': 'Sức khỏe',
      'longform': 'Longform',
      'long-form': 'Longform',
    };
    const mockKey = categoryMappings[category.slug] || category.name_vi || category.name || '';

    // Use getArticlesByCategory for all categories - it handles special logic for "Mới nhất", "Đọc nhiều" and extends other categories
    return translateMockArticles(getArticlesByCategory(mockKey), language);
  }, [category, language]);

  useEffect(() => {
    // Reset visible count when slug changes, use different count for longform
    setVisibleCount(isLongform ? LONGFORM_ITEMS_PER_PAGE : ITEMS_PER_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isLongform]);

  useEffect(() => {
    const run = async () => {
      if (!category) return;
      const reqId = ++reqIdRef.current;
      setArticlesLoading(true);
      setArticlesError(null);

      let pbMapped: Article[] = [];
      const isStaticCategory = category.id.startsWith("static-cat-");

      // Only fetch from PB if this is a real PB category
      if (!isStaticCategory) {
        try {
          type PbArticle = {
            id: string;
            slug?: string;
            title_vi?: string;
            title_jp?: string;
            sapo_vi?: string;
            sapo_jp?: string;
            thumbnail?: string;
            publishedAt?: string;
            created?: string;
            readingMinutes?: number;
            categories?: string[];
          };

          // Filter: status="published" AND categories contains this category id
          const filter = `status="published" && categories~"${category.id}"`;
          const res = await pb.collection("articles").getList<PbArticle>(1, 200, {
            filter,
            sort: "-publishedAt,-created",
          });

          if (reqId !== reqIdRef.current) return;

          const readTimeLabel = language === "JP" ? "分" : "phút đọc";
          pbMapped = (res.items || []).map((a) => {
            const title =
              language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");
            const summary =
              language === "JP" ? (a.sapo_jp || a.sapo_vi || "") : (a.sapo_vi || a.sapo_jp || "");
            const dateStr = a.publishedAt || a.created || "";
            const date = dateStr ? new Date(dateStr).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN") : "";
            const mins = typeof a.readingMinutes === "number" ? a.readingMinutes : 0;
            const readTime = mins > 0 ? (language === "JP" ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : "";
            const image = getPbFileUrl(a, a.thumbnail) || "";
            return {
              id: a.slug || a.id,
              title: title || "(Untitled)",
              summary,
              category: categoryName,
              image,
              author: "",
              date,
              readTime,
            } satisfies Article;
          });

          // Merge PB articles with static articles and mockData for this category
          // Sort by publishedAt/created descending (newest first)
          const merged = [...pbMapped, ...staticArticlesForCategory, ...mockArticlesForCategory];
          merged.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-')).getTime() || 0;
            const dateB = new Date(b.date.split('/').reverse().join('-')).getTime() || 0;
            return dateB - dateA;
          });
          setArticles(merged);
        } catch (err: unknown) {
          if (reqId !== reqIdRef.current) return;
          // PB failed – still show static articles + mockData
          const fallback = [...staticArticlesForCategory, ...mockArticlesForCategory];
          setArticles(fallback);
          if (!fallback.length) {
            setArticlesError(err instanceof Error ? err.message : "Failed to load articles");
          }
        } finally {
          if (reqId !== reqIdRef.current) return;
          setArticlesLoading(false);
        }
      } else {
        // Pure static category – show static articles + mockData
        const merged = [...staticArticlesForCategory, ...mockArticlesForCategory];
        setArticles(merged);
        setArticlesLoading(false);
      }
    };

    if (!category) {
      setArticles([]);
      setArticlesLoading(false);
      setArticlesError(null);
      return;
    }

    run();
  }, [category, language, categoryName, staticArticlesForCategory, mockArticlesForCategory]);

  const handleLoadMore = () => {
    const increment = isLongform ? LONGFORM_ITEMS_PER_PAGE : ITEMS_PER_PAGE;
    setVisibleCount(prev => prev + increment);
  };

  // Slicing data for the layout
  const spotlightArticle = articles[0] || null;
  const subFeaturedArticles = articles.slice(1, 5);
  const feedArticles = articles.slice(5);
  const paginatedFeed = feedArticles.slice(0, visibleCount);
  const hasMore = visibleCount < feedArticles.length;

  // Get other categories for the bottom section (4 categories + Longform = 5)
  const otherCategories = useMemo(() => {
    const filtered = categories
      .filter(c => {
        if (c.slug === slug) return false;
        const normalized = c.slug.toLowerCase().replace(/\s+/g, '');
        return normalized !== 'longform' && normalized !== 'long-form';
      })
      .slice(0, 4);

    // Add Longform at the end if not current category
    const longformCat = categories.find(c => {
      const normalized = c.slug.toLowerCase().replace(/\s+/g, '');
      return normalized === 'longform' || normalized === 'long-form';
    });
    if (longformCat && longformCat.slug !== slug) {
      filtered.push(longformCat);
    }
    return filtered;
  }, [categories, slug]);

  // Get articles for other categories from mockData
  const getOtherCategoryArticles = (cat: typeof categories[0]) => {
    // Map slug to mockData category name
    const slugToCategoryMap: Record<string, string> = {
      'kinh-doanh': 'Kinh doanh',
      'xa-hoi': 'Xã hội',
      'doi-song': 'Đời sống',
      'du-lich': 'Du lịch',
      'van-hoa': 'Văn hóa',
      'giao-duc': 'Giáo dục',
      'suc-khoe': 'Sức khỏe',
      'longform': 'Longform',
      'long-form': 'Longform',
    };
    const categoryName = slugToCategoryMap[cat.slug] || cat.name_vi || cat.slug;
    const mockArticles = translateMockArticles(getArticlesByCategory(categoryName), language);
    return mockArticles.slice(0, 4);
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">{t("loading")}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {t("not_found_category")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t("not_found_category_desc")}
          </p>
          <Link to="/" className="mt-4 inline-block text-foreground underline hover:text-muted-foreground">
            {t("back_home")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // For longform, use different pagination
  const longformVisibleArticles = articles.slice(0, visibleCount);
  const longformHasMore = visibleCount < articles.length;

  // Longform layout
  if (isLongform) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <main>
          {/* Hero Section */}
          <div className="relative w-full h-[350px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&q=80"
              alt="Longform Cover"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80";
                target.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative h-full flex items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white uppercase tracking-widest text-center">
                {categoryName}
              </h1>
            </div>
          </div>

          {/* Content Grid */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 mb-20">
            {articlesLoading ? (
              <div className="py-6 text-center text-muted-foreground">{t("loading")}</div>
            ) : articles.length === 0 ? (
              <p className="text-center text-muted-foreground italic">{t("no_articles")}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {longformVisibleArticles.map((article) => (
                    <Link key={article.id} to={`/longform/${article.id}`} className="group block">
                      <div className="flex flex-col">
                        <div className="aspect-[3/2] w-full overflow-hidden rounded-sm bg-gray-100">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";
                              target.onerror = null;
                            }}
                          />
                        </div>
                        <h2 className="mt-4 text-xl font-serif font-bold text-gray-900 leading-relaxed group-hover:underline decoration-1 underline-offset-4">
                          {article.title}
                        </h2>
                      </div>
                    </Link>
                  ))}
                </div>

                {longformHasMore && (
                  <div className="mt-16 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-[#7c3aed] text-white font-bold rounded-sm hover:bg-[#4d0078] transition-colors"
                    >
                      {language === "JP" ? "もっと見る" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
        <BackToTopButton />
      </div>
    );
  }

  // Default category layout
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-[1140px]">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  {language === "JP" ? "トップ" : "Chuyên mục"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-primary">{categoryName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Title */}
        <div className="mb-10 border-b border-gray-100 pb-4 flex items-center gap-4">
          <span
            className="inline-block w-2.5 h-10 rounded-sm"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
              transform: "skewX(-15deg)",
            }}
          />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {categoryName}
          </h1>
        </div>

        {/* --- SECTION 1: HERO (Top) --- */}
        {!articlesLoading && spotlightArticle && (
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1. Spotlight Article (Left - 7/12) */}
              <div className="lg:col-span-7 group cursor-pointer">
                <Link to={`/longform/${spotlightArticle.id}`}>
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-sm mb-4">
                    <img
                      src={spotlightArticle.image}
                      alt={spotlightArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";
                        target.onerror = null;
                      }}
                    />
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {spotlightArticle.title}
                  </h2>
                </Link>
              </div>

              {/* 2. Sub-featured Grid (Right - 5/12) */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {subFeaturedArticles.map((article) => (
                    <Link key={article.id} to={`/longform/${article.id}`} className="group cursor-pointer flex flex-col gap-2">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-sm">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";
                            target.onerror = null;
                          }}
                        />
                      </div>
                      <h3 className="font-serif text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {!articlesLoading && articles.length > 0 && <Separator className="mb-12" />}

        {/* --- SECTION 2: MAIN CONTENT & SIDEBAR (Bottom) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10" id="category-feed">
          {/* Left Column: Article Feed (8 cols ~ 66%) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col gap-5">
              {articlesLoading ? (
                <div className="py-6 text-sm text-muted-foreground italic">{t("loading")}</div>
              ) : articlesError ? (
                <div className="py-6 text-sm text-muted-foreground">{articlesError}</div>
              ) : paginatedFeed.length > 0 ? (
                paginatedFeed.map((article) => (
                  <Link key={article.id} to={`/longform/${article.id}`} className="group flex flex-col sm:flex-row gap-6 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    {/* Image Left */}
                    <div className="sm:w-1/3 shrink-0">
                      <div className="aspect-[3/2] overflow-hidden rounded-sm">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";
                            target.onerror = null;
                          }}
                        />
                      </div>
                    </div>
                    {/* Content Right */}
                    <div className="sm:w-2/3 flex flex-col justify-start">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        {categoryName}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                    </div>
                  </Link>
                ))
              ) : !articlesLoading && articles.length === 0 ? (
                <p className="text-muted-foreground italic">{t("no_articles")}</p>
              ) : null}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-[#7c3aed] text-white font-bold rounded-sm hover:bg-[#4d0078] transition-colors"
                >
                  {language === "JP" ? "もっと見る" : "Xem thêm"}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar (4 cols ~ 33%) */}
          <aside className="lg:col-span-4 pl-0 lg:pl-4">
            <div className="lg:sticky lg:top-24">
              <CategorySidebar />
            </div>
          </aside>
        </div>

        {/* --- SECTION 3: OTHER CATEGORIES --- */}
        {otherCategories.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="inline-block w-2.5 h-8 rounded-sm"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
                  transform: "skewX(-15deg)",
                }}
              />
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                {language === "JP" ? "その他のジャンル" : "CÁC CHUYÊN MỤC KHÁC"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {otherCategories.map((cat) => {
                const catArticles = getOtherCategoryArticles(cat);
                const latest = catArticles[0];
                const others = catArticles.slice(1, 4);
                const catLabel = getCategoryLabelByLanguage(cat, language);

                return (
                  <div key={cat.id} className="space-y-4">
                    <Link to={`/category/${cat.slug}`} className="block group">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 hover:text-primary transition-colors">{catLabel}</h3>
                      {latest && (
                        <div className="space-y-3">
                          <div className="aspect-[3/2] overflow-hidden rounded-sm">
                            <img
                              src={latest.image}
                              alt={latest.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80";
                                target.onerror = null;
                              }}
                            />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                            {latest.title}
                          </h4>
                        </div>
                      )}
                    </Link>
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {others.map((art) => (
                        <Link key={art.id} to={`/longform/${art.id}`} className="block group">
                          <h4 className="text-sm font-bold text-black hover:text-[#7c3aed] transition-colors leading-normal line-clamp-2">
                            {art.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default CategoryPage;