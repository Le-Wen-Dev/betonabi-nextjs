import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import ArticleContent from "@/components/ArticleContent";
import ArticleSidebar from "@/components/ArticleSidebar";
import ArticleTags from "@/components/ArticleTags";
import CommentSection from "@/components/CommentSection";
import ShareButtons from "@/components/ShareButtons";
import LongformArticle from "@/components/LongformArticle";
import { useLanguage } from "@/contexts/LanguageContext";
import { getArticleBySlug } from "@/lib/articles";
import { createArticleView } from "@/lib/articleViews";
import { getPbFileUrl } from "@/lib/pbFiles";
import { pb } from "@/lib/pb";
import type { ArticleContent as ArticleContentBlock } from "@/data/articleContent";
import type { Article } from "@/data/mockData";
import { usePublishedArticles, type PublishedArticle } from "@/contexts/PublishedArticlesContext";
import { getStaticArticleDetail } from "@/data/staticArticles";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { toast } from "@/components/ui/use-toast";
import { isArticleSaved, saveArticle, unsaveArticle } from "@/lib/savedArticles";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const { items: publishedItems } = usePublishedArticles();
  const { user } = useAuth();
  const { categories: allCategories } = useCategories();

  type PbArticleForPage = {
    id: string;
    slug?: string;
    title_vi?: string;
    title_jp?: string;
    sapo_vi?: string;
    sapo_jp?: string;
    content_vi?: string;
    content_jp?: string;
    tags?: unknown;
    thumbnail?: string;
    publishedAt?: string;
    location?: string;
    status?: string;
    readingMinutes?: number;
    longform?: boolean;
    author?: string;
    category?: string; // relation id (categories)
    // SEO fields
    seo_title_vi?: string;
    seo_title_jp?: string;
    seo_description_vi?: string;
    seo_description_jp?: string;
    og_image?: string;
    canonical_url?: string;
    noindex?: string;
    expand?: {
      category?: { id?: string; slug?: string; name_vi?: string; name_jp?: string; name?: string };
      author?: { name?: string; email?: string };
    };
  };

  const [pbArticle, setPbArticle] = useState<PbArticleForPage | null>(null);
  const [loadingPb, setLoadingPb] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingSave, setIsSavingSave] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const readTimeLabel = t("readTime");
  const toMs = useCallback((a: { publishedAt?: string; created?: string } | null | undefined) => {
    const s = a?.publishedAt || a?.created;
    const ms = s ? Date.parse(s) : 0;
    return Number.isFinite(ms) ? ms : 0;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!slug) {
        setLoadingPb(false);
        return;
      }
      setLoadingPb(true);
      try {
        // First try PocketBase
        const bySlug = await getArticleBySlug(slug);
        if (bySlug) {
          setPbArticle(bySlug);
          return;
        }
        // Fallback: check if this is a static mock article
        const staticDetail = getStaticArticleDetail(slug);
        if (staticDetail) {
          setPbArticle(staticDetail as PbArticleForPage);
          return;
        }
        setPbArticle(null);
      } catch {
        // PB failed – still try static fallback
        const staticDetail = getStaticArticleDetail(slug!);
        if (staticDetail) {
          setPbArticle(staticDetail as PbArticleForPage);
          return;
        }
        setPbArticle(null);
      } finally {
        setLoadingPb(false);
      }
    };
    run();
  }, [slug]);

  // ─── SEO: Inject meta tags into <head> ───
  useEffect(() => {
    if (!pbArticle) return;

    const seoTitle = language === "JP"
      ? (pbArticle.seo_title_jp || pbArticle.title_jp || pbArticle.title_vi || "")
      : (pbArticle.seo_title_vi || pbArticle.title_vi || pbArticle.title_jp || "");
    const seoDesc = language === "JP"
      ? (pbArticle.seo_description_jp || pbArticle.sapo_jp || pbArticle.sapo_vi || "")
      : (pbArticle.seo_description_vi || pbArticle.sapo_vi || pbArticle.sapo_jp || "");
    const ogImg = pbArticle.og_image
      ? getPbFileUrl(pbArticle, pbArticle.og_image)
      : pbArticle.thumbnail
        ? getPbFileUrl(pbArticle, pbArticle.thumbnail)
        : null;
    const pageUrl = window.location.href;
    const canonical = pbArticle.canonical_url || pageUrl;

    // Set document title
    const prevTitle = document.title;
    document.title = seoTitle ? `${seoTitle} | Betonabi` : "Betonabi";

    // Helper to set/create a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    const tags: HTMLMetaElement[] = [];
    if (seoDesc) tags.push(setMeta("name", "description", seoDesc));
    if (pbArticle.noindex === "true") tags.push(setMeta("name", "robots", "noindex, nofollow"));
    tags.push(setMeta("property", "og:title", seoTitle));
    if (seoDesc) tags.push(setMeta("property", "og:description", seoDesc));
    tags.push(setMeta("property", "og:url", pageUrl));
    tags.push(setMeta("property", "og:type", "article"));
    if (ogImg) tags.push(setMeta("property", "og:image", ogImg));
    tags.push(setMeta("name", "twitter:card", "summary_large_image"));
    tags.push(setMeta("name", "twitter:title", seoTitle));
    if (seoDesc) tags.push(setMeta("name", "twitter:description", seoDesc));
    if (ogImg) tags.push(setMeta("name", "twitter:image", ogImg));

    // Canonical link
    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const createdLink = !linkEl;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "canonical");
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute("href", canonical);

    // Cleanup on unmount or re-render
    return () => {
      document.title = prevTitle;
      tags.forEach((el) => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      if (createdLink && linkEl?.parentNode) linkEl.parentNode.removeChild(linkEl);
    };
  }, [pbArticle, language]);

  // Fetch author name if expand didn't work
  useEffect(() => {
    const fetchAuthorName = async () => {
      // If expand already has author name, use it
      if (pbArticle?.expand?.author?.name) {
        setAuthorName(pbArticle.expand.author.name);
        return;
      }
      if (pbArticle?.expand?.author?.email) {
        setAuthorName(pbArticle.expand.author.email);
        return;
      }
      // If we have author ID but no expanded data, fetch it
      if (pbArticle?.author && typeof pbArticle.author === 'string') {
        try {
          const authorRecord = await pb.collection('users').getOne(pbArticle.author);
          setAuthorName(authorRecord.name || authorRecord.email || 'Author');
        } catch {
          setAuthorName('Author');
        }
      } else {
        setAuthorName(null);
      }
    };
    fetchAuthorName();
  }, [pbArticle]);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) {
        setIsSaved(false);
        return;
      }
      const articleId = pbArticle?.id;
      if (!articleId) {
        setIsSaved(false);
        return;
      }
      try {
        const saved = await isArticleSaved({ userId: user.id, articleId });
        setIsSaved(saved);
      } catch {
        // ignore
        setIsSaved(false);
      }
    };
    run();
  }, [user?.id, pbArticle?.id]);

  const toggleSaved = async () => {
    if (!user?.id) {
      toast({
        title: language === "JP" ? "ログインしてください" : "Vui lòng đăng nhập",
        description: language === "JP" ? "記事を保存するにはログインが必要です。" : "Bạn cần đăng nhập để lưu bài viết.",
        variant: "destructive",
      });
      return;
    }
    const articleId = pbArticle?.id;
    if (!articleId) return;
    if (isSavingSave) return;
    setIsSavingSave(true);
    try {
      if (isSaved) {
        await unsaveArticle({ userId: user.id, articleId });
        setIsSaved(false);
        toast({ title: language === "JP" ? "保存を解除しました" : "Đã bỏ lưu" });
      } else {
        await saveArticle({ userId: user.id, articleId });
        setIsSaved(true);
        toast({ title: language === "JP" ? "保存しました" : "Đã lưu bài viết" });
      }
    } catch (err: unknown) {
      toast({
        title: language === "JP" ? "失敗しました" : "Thao tác thất bại",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSavingSave(false);
    }
  };

  const categorySlug = pbArticle?.expand?.category?.slug || "";

  // Detect longform article
  const isLongform = useMemo(() => {
    if ((pbArticle as Record<string, unknown> | null)?.longform) return true;
    // Also check from publishedItems list
    const currentId = pbArticle?.id;
    if (!currentId) return false;
    return (publishedItems as PublishedArticle[]).some(
      (a) => (a.id === currentId || a.slug === slug) && a.longform
    );
  }, [pbArticle, publishedItems, slug]);

  const pbTitle =
    language === "JP"
      ? (pbArticle?.title_jp || pbArticle?.title_vi)
      : pbArticle?.title_vi;
  const pbSapo =
    language === "JP"
      ? (pbArticle?.sapo_jp || pbArticle?.sapo_vi)
      : pbArticle?.sapo_vi;
  const pbContentRaw =
    language === "JP"
      ? (pbArticle?.content_jp || pbArticle?.content_vi)
      : pbArticle?.content_vi;

  // PocketBase auto-parses JSON fields into objects.
  // Normalize to string for consistent handling.
  const pbContent = useMemo(() => {
    if (!pbContentRaw) return "";
    if (typeof pbContentRaw === "string") return pbContentRaw;
    // If PB already parsed it into an object, stringify it back
    try {
      return JSON.stringify(pbContentRaw);
    } catch {
      return "";
    }
  }, [pbContentRaw]);

  // Detect content type: JSON blocks, HTML, or plain text
  const isJsonBlockContent = useMemo(() => {
    const raw = pbContent.trim();
    if (!raw) return false;
    if (!raw.startsWith("{") && !raw.startsWith("[")) return false;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return true;
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) return true;
      return false;
    } catch {
      return false;
    }
  }, [pbContent]);

  // Detect if content contains HTML tags
  const isHtmlContent = useMemo(() => {
    if (isJsonBlockContent) return false;
    const raw = pbContent.trim();
    // Check for common HTML tags
    return /<[a-z][\s\S]*>/i.test(raw);
  }, [pbContent, isJsonBlockContent]);

  const pbBlocks: ArticleContentBlock[] = useMemo(() => {
    if (isJsonBlockContent || isHtmlContent) return []; // Will use htmlContent/jsonContent prop instead
    const raw = pbContent.trim();
    if (!raw) return [];
    return raw
      .split(/\n{2,}/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ type: "paragraph", text } as ArticleContentBlock));
  }, [pbContent, isHtmlContent, isJsonBlockContent]);

  const pbImageUrl = useMemo(() => {
    const file = pbArticle?.thumbnail;
    if (!file) return null;
    return getPbFileUrl(pbArticle, file);
  }, [pbArticle]);

  const pbTags = useMemo(() => {
    const t = pbArticle?.tags as unknown;
    if (Array.isArray(t)) return t.filter((x) => typeof x === "string") as string[];
    return [];
  }, [pbArticle]);

  const pbAuthorName = authorName || "Author";

  const pbCategoryName =
    language === "JP"
      ? (pbArticle?.expand?.category?.name_jp ||
        pbArticle?.expand?.category?.name)
      : (pbArticle?.expand?.category?.name_vi ||
        pbArticle?.expand?.category?.name);

  const pbPublishedAt = pbArticle?.publishedAt;
  const pbDateLabel = pbPublishedAt
    ? new Date(pbPublishedAt).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN")
    : "";
  const pbLocation = pbArticle?.location || "";
  const pbStatus = pbArticle?.status || "";
  const pbReadingMinutes = pbArticle?.readingMinutes || 0;
  const pbReadTimeLabel =
    pbReadingMinutes > 0
      ? (language === "JP" ? `${pbReadingMinutes}${t("readTime")}` : `${pbReadingMinutes} ${t("readTime")}`)
      : "";

  const mapPbToCardArticle = useCallback((a: PublishedArticle): Article => {
    const title =
      language === "JP" ? (a.title_jp || a.title_vi || "") : (a.title_vi || a.title_jp || "");
    const summary =
      language === "JP" ? (a.sapo_jp || a.sapo_vi || "") : (a.sapo_vi || a.sapo_jp || "");
    const categoryLabel =
      language === "JP"
        ? (a.expand?.category?.name_jp || a.expand?.category?.name_vi || a.expand?.category?.name || a.expand?.category?.slug)
        : (a.expand?.category?.name_vi || a.expand?.category?.name_jp || a.expand?.category?.name || a.expand?.category?.slug);
    const authorName = a.expand?.author?.name || a.expand?.author?.email || "Author";
    const dateStr = a.publishedAt || a.created || "";
    const date = dateStr ? new Date(dateStr).toLocaleDateString(language === "JP" ? "ja-JP" : "vi-VN") : "";
    const mins = typeof a.readingMinutes === "number" ? a.readingMinutes : 0;
    const readTime = mins > 0 ? (language === "JP" ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : "";
    const image = getPbFileUrl(a, a.thumbnail) || "";
    return {
      id: a.slug || a.id,
      title: title || "(Untitled)",
      summary,
      category: categoryLabel || a.category || "Category",
      image,
      author: authorName,
      date,
      readTime,
    };
  }, [language, readTimeLabel]);

  const publishedSortedByTime = useMemo(() => {
    const items = (publishedItems as PublishedArticle[]) || [];
    return [...items].sort((a, b) => toMs(b) - toMs(a));
  }, [publishedItems, toMs]);

  const mostViewed = useMemo(() => {
    const items = (publishedItems as PublishedArticle[]) || [];
    const currentId = pbArticle?.id;
    const sorted = [...items].sort((a, b) => {
      const av = typeof a.views === "number" && Number.isFinite(a.views) ? a.views : 0;
      const bv = typeof b.views === "number" && Number.isFinite(b.views) ? b.views : 0;
      if (bv !== av) return bv - av;
      return toMs(b) - toMs(a);
    });
    return sorted
      .filter((a) => a.id !== currentId)
      .slice(0, 5)
      .map(mapPbToCardArticle);
  }, [publishedItems, pbArticle?.id, mapPbToCardArticle, toMs]);

  const relatedCategory = useMemo(() => {
    const items = (publishedItems as PublishedArticle[]) || [];
    const categoryId = pbArticle?.category || pbArticle?.expand?.category?.id;
    if (!categoryId) return [];
    return publishedSortedByTime
      .filter((a) => a.id !== pbArticle?.id && a.category === categoryId)
      .slice(0, 5)
      .map(mapPbToCardArticle);
  }, [publishedItems, publishedSortedByTime, pbArticle?.category, pbArticle?.expand?.category?.id, pbArticle?.id, mapPbToCardArticle]);

  const prevNext = useMemo(() => {
    const currentId = pbArticle?.id;
    if (!currentId) return { previous: undefined as Article | undefined, next: undefined as Article | undefined };
    const idx = publishedSortedByTime.findIndex((a) => a.id === currentId);
    if (idx < 0) return { previous: undefined as Article | undefined, next: undefined as Article | undefined };
    const previousRaw = publishedSortedByTime[idx + 1];
    const nextRaw = publishedSortedByTime[idx - 1];
    return {
      previous: previousRaw ? mapPbToCardArticle(previousRaw) : undefined,
      next: nextRaw ? mapPbToCardArticle(nextRaw) : undefined,
    };
  }, [pbArticle?.id, publishedSortedByTime, mapPbToCardArticle]);

  useEffect(() => {
    if (!slug) return;
    if (!pbArticle) return;
    if (pbStatus !== "published") return;
    try {
      const sidKey = "viewer_session_id";
      let sid = sessionStorage.getItem(sidKey);
      if (!sid) {
        sid =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? (crypto.randomUUID() as string)
            : String(Math.random()).slice(2) + String(Date.now());
        sessionStorage.setItem(sidKey, sid);
      }

      const articleId = pbArticle?.id || slug;
      const viewKey = `${articleId}:${sid}`;
      const onceKey = `viewed_article_${viewKey}`;
      if (sessionStorage.getItem(onceKey)) return;
      sessionStorage.setItem(onceKey, "1");

      createArticleView({ key: viewKey, articleId }).catch(() => {
        // ignore
      });
    } catch {
      // ignore
    }
  }, [slug, pbStatus, pbArticle]);

  // Other categories for bottom section
  const otherCategories = useMemo(() => {
    const currentCatSlug = pbArticle?.expand?.category?.slug;
    const currentCatId = pbArticle?.category || pbArticle?.expand?.category?.id;
    return allCategories.filter((c) => {
      // Exclude current article's category by both id and slug
      if (c.id === currentCatId) return false;
      if (currentCatSlug && c.slug === currentCatSlug) return false;
      return true;
    }).slice(0, 5);
  }, [allCategories, pbArticle?.category, pbArticle?.expand?.category?.id, pbArticle?.expand?.category?.slug]);

  const articlesByCategory = useMemo(() => {
    const map = new Map<string, Article[]>();
    for (const cat of otherCategories) {
      const catArticles = (publishedItems as PublishedArticle[])
        .filter((a) => {
          const catId = a.category || a.expand?.category?.id;
          const catSlug = a.expand?.category?.slug;
          // Match by id OR by slug to support both PB and static articles
          return catId === cat.id || (catSlug && catSlug === cat.slug);
        })
        .sort((a, b) => toMs(b) - toMs(a))
        .slice(0, 4)
        .map(mapPbToCardArticle);
      map.set(cat.id, catArticles);
    }
    return map;
  }, [otherCategories, publishedItems, toMs, mapPbToCardArticle]);

  // Render branches AFTER all hooks above (Rules of Hooks).
  if (loadingPb) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          {t("loading_article")}
        </div>
        <Footer />
      </div>
    );
  }

  if (!loadingPb && !pbArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold">{t("not_found_article")}</h1>
          <p className="mt-4 text-muted-foreground">
            {t("not_found_article_desc")}
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            {t("back_home")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Longform articles → full-width hero layout
  if (isLongform) {
    return (
      <LongformArticle
        title={pbTitle || t("no_title")}
        sapo={pbSapo || ""}
        imageUrl={pbImageUrl}
        authorName={pbAuthorName}
        dateLabel={pbDateLabel}
        categorySlug={categorySlug}
        categoryName={pbCategoryName || t("category")}
        tags={pbTags}
        articleId={pbArticle?.id || slug || "default"}
        content={pbBlocks}
        htmlContent={(isHtmlContent || isJsonBlockContent) ? (pbContent || "") : undefined}
        otherCategories={otherCategories}
        articlesByCategory={articlesByCategory}
      />
    );
  }

  // Standard articles → grid layout with sidebar
  const htmlOrJson = (isHtmlContent || isJsonBlockContent) ? (pbContent || "") : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            {language === "JP" ? "トップ" : "Trang chủ"}
          </Link>
          <span>/</span>
          {categorySlug && (
            <>
              <Link to={`/category/${categorySlug}`} className="hover:text-primary transition-colors">
                {pbCategoryName || t("category")}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400 line-clamp-1">{pbTitle}</span>
        </nav>

        {/* Tags bar */}
        {pbTags.length > 0 && (
          <div className="mb-6">
            <ArticleTags tags={pbTags} />
          </div>
        )}

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* Left: Article content */}
          <article className="min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {pbTitle || t("no_title")}
            </h1>

            {pbSapo && (
              <p className="text-lg font-semibold text-gray-700 leading-relaxed mb-6">
                {pbSapo}
              </p>
            )}

            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none">
              <ArticleContent
                content={pbBlocks}
                htmlContent={htmlOrJson}
              />
            </div>

            {/* Author */}
            <div className="mt-8 mb-4 text-right">
              <Link
                to={`/author/${encodeURIComponent(pbAuthorName)}`}
                className="font-bold text-lg text-gray-900 hover:underline hover:text-primary transition-colors"
              >
                {pbAuthorName}
              </Link>
            </div>

            {/* Share */}
            <div className="pt-4 border-t border-gray-100">
              <ShareButtons url={window.location.href} title={pbTitle || ""} />
            </div>

            {/* Comments */}
            <div id="comments" className="mt-8">
              <CommentSection articleId={pbArticle?.id || slug || "default"} />
            </div>
          </article>

          {/* Right: Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleSidebar mostViewed={mostViewed} relatedCategory={relatedCategory} />
            </div>
          </aside>
        </div>

        {/* Mobile sidebar (below content) */}
        <div className="lg:hidden mt-8">
          <ArticleSidebar mostViewed={mostViewed} relatedCategory={relatedCategory} />
        </div>

        {/* Other categories section */}
        {otherCategories.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-10">
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
                const catArticles = articlesByCategory.get(cat.id) || [];
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
                              src={latest.image || "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80"}
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
                    {others.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        {others.map((art) => (
                          <Link key={art.id} to={`/longform/${art.id}`} className="block group">
                            <h4 className="text-sm font-bold text-black hover:text-[#7c3aed] transition-colors leading-normal line-clamp-2">
                              {art.title}
                            </h4>
                          </Link>
                        ))}
                      </div>
                    )}
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

export default ArticlePage;
