'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import ArticleContent from '@/components/ArticleContent';
import ArticleSidebar from '@/components/ArticleSidebar';
import ArticleTags from '@/components/ArticleTags';
import CommentSection from '@/components/CommentSection';
import ShareButtons from '@/components/ShareButtons';
import LongformArticle from '@/components/LongformArticle';
import { useLanguage } from '@/contexts/LanguageContext';
import { getArticleBySlug } from '@/lib/articles';
import { createArticleView } from '@/lib/articleViews';
import { getPbFileUrl } from '@/lib/pbFiles';
import { pb } from '@/lib/pb';
import type { ArticleContent as ArticleContentBlock } from '@/data/articleContent';
import type { Article } from '@/data/mockData';
import { usePublishedArticles, type PublishedArticle } from '@/contexts/PublishedArticlesContext';
import { getStaticArticleDetail } from '@/data/staticArticles';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { getCategoryLabelByLanguage } from '@/lib/categories';
import { toast } from '@/components/ui/use-toast';
import { isArticleSaved, saveArticle, unsaveArticle } from '@/lib/savedArticles';
import { localePath } from '@/lib/navigation';

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
  category?: string;
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

export default function ArticlePageClient({ slug, lang }: { slug: string; lang: string }) {
  const locale = lang;
  const { language, t } = useLanguage();
  const { items: publishedItems } = usePublishedArticles();
  const { user } = useAuth();
  const { categories: allCategories } = useCategories();

  const [pbArticle, setPbArticle] = useState<PbArticleForPage | null>(null);
  const [loadingPb, setLoadingPb] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingSave, setIsSavingSave] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const readTimeLabel = t('readTime');
  const toMs = useCallback((a: { publishedAt?: string; created?: string } | null | undefined) => {
    const s = a?.publishedAt || (a as any)?.created;
    const ms = s ? Date.parse(s) : 0;
    return Number.isFinite(ms) ? ms : 0;
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!slug) { setLoadingPb(false); return; }
      setLoadingPb(true);
      try {
        const bySlug = await getArticleBySlug(slug);
        if (bySlug) { setPbArticle(bySlug); return; }
        const staticDetail = getStaticArticleDetail(slug);
        if (staticDetail) { setPbArticle(staticDetail as PbArticleForPage); return; }
        setPbArticle(null);
      } catch {
        const staticDetail = getStaticArticleDetail(slug);
        if (staticDetail) { setPbArticle(staticDetail as PbArticleForPage); return; }
        setPbArticle(null);
      } finally {
        setLoadingPb(false);
      }
    };
    run();
  }, [slug]);

  useEffect(() => {
    const fetchAuthorName = async () => {
      if (pbArticle?.expand?.author?.name) { setAuthorName(pbArticle.expand.author.name); return; }
      if (pbArticle?.expand?.author?.email) { setAuthorName(pbArticle.expand.author.email); return; }
      if (pbArticle?.author && typeof pbArticle.author === 'string') {
        try {
          const authorRecord = await pb.collection('users').getOne(pbArticle.author);
          setAuthorName(authorRecord.name || authorRecord.email || 'Author');
        } catch { setAuthorName('Author'); }
      } else { setAuthorName(null); }
    };
    fetchAuthorName();
  }, [pbArticle]);

  useEffect(() => {
    const run = async () => {
      if (!user?.id) { setIsSaved(false); return; }
      const articleId = pbArticle?.id;
      if (!articleId) { setIsSaved(false); return; }
      try {
        const saved = await isArticleSaved({ userId: user.id, articleId });
        setIsSaved(saved);
      } catch { setIsSaved(false); }
    };
    run();
  }, [user?.id, pbArticle?.id]);

  const toggleSaved = async () => {
    if (!user?.id) {
      toast({
        title: language === 'JP' ? 'ログインしてください' : 'Vui lòng đăng nhập',
        description: language === 'JP' ? '記事を保存するにはログインが必要です。' : 'Bạn cần đăng nhập để lưu bài viết.',
        variant: 'destructive',
      });
      return;
    }
    const articleId = pbArticle?.id;
    if (!articleId || isSavingSave) return;
    setIsSavingSave(true);
    try {
      if (isSaved) {
        await unsaveArticle({ userId: user.id, articleId });
        setIsSaved(false);
        toast({ title: language === 'JP' ? '保存を解除しました' : 'Đã bỏ lưu' });
      } else {
        await saveArticle({ userId: user.id, articleId });
        setIsSaved(true);
        toast({ title: language === 'JP' ? '保存しました' : 'Đã lưu bài viết' });
      }
    } catch (err: unknown) {
      toast({
        title: language === 'JP' ? '失敗しました' : 'Thao tác thất bại',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally { setIsSavingSave(false); }
  };

  const categorySlug = pbArticle?.expand?.category?.slug || '';

  const isLongform = useMemo(() => {
    if ((pbArticle as Record<string, unknown> | null)?.longform) return true;
    const currentId = pbArticle?.id;
    if (!currentId) return false;
    return (publishedItems as PublishedArticle[]).some(
      (a) => (a.id === currentId || a.slug === slug) && a.longform
    );
  }, [pbArticle, publishedItems, slug]);

  const pbTitle = language === 'JP' ? (pbArticle?.title_jp || pbArticle?.title_vi) : pbArticle?.title_vi;
  const pbSapo = language === 'JP' ? (pbArticle?.sapo_jp || pbArticle?.sapo_vi) : pbArticle?.sapo_vi;
  const pbContentRaw = language === 'JP' ? (pbArticle?.content_jp || pbArticle?.content_vi) : pbArticle?.content_vi;

  const pbContent = useMemo(() => {
    if (!pbContentRaw) return '';
    if (typeof pbContentRaw === 'string') return pbContentRaw;
    try { return JSON.stringify(pbContentRaw); } catch { return ''; }
  }, [pbContentRaw]);

  const isJsonBlockContent = useMemo(() => {
    const raw = pbContent.trim();
    if (!raw || (!raw.startsWith('{') && !raw.startsWith('['))) return false;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return true;
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) return true;
      return false;
    } catch { return false; }
  }, [pbContent]);

  const isHtmlContent = useMemo(() => {
    if (isJsonBlockContent) return false;
    return /<[a-z][\s\S]*>/i.test(pbContent.trim());
  }, [pbContent, isJsonBlockContent]);

  const pbBlocks: ArticleContentBlock[] = useMemo(() => {
    if (isJsonBlockContent || isHtmlContent) return [];
    const raw = pbContent.trim();
    if (!raw) return [];
    return raw
      .split(/\n{2,}/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', text } as ArticleContentBlock));
  }, [pbContent, isHtmlContent, isJsonBlockContent]);

  const pbImageUrl = useMemo(() => {
    const file = pbArticle?.thumbnail;
    if (!file) return null;
    return getPbFileUrl(pbArticle, file);
  }, [pbArticle]);

  const pbTags = useMemo(() => {
    const t = pbArticle?.tags as unknown;
    if (Array.isArray(t)) return t.filter((x) => typeof x === 'string') as string[];
    return [];
  }, [pbArticle]);

  const pbAuthorName = authorName || 'Author';

  const pbCategoryName =
    language === 'JP'
      ? (pbArticle?.expand?.category?.name_jp || pbArticle?.expand?.category?.name)
      : (pbArticle?.expand?.category?.name_vi || pbArticle?.expand?.category?.name);

  const pbPublishedAt = pbArticle?.publishedAt;
  const pbDateLabel = pbPublishedAt
    ? new Date(pbPublishedAt).toLocaleDateString(language === 'JP' ? 'ja-JP' : 'vi-VN')
    : '';
  const pbStatus = pbArticle?.status || '';
  const pbReadingMinutes = pbArticle?.readingMinutes || 0;

  const mapPbToCardArticle = useCallback((a: PublishedArticle): Article => {
    const title = language === 'JP' ? (a.title_jp || a.title_vi || '') : (a.title_vi || a.title_jp || '');
    const summary = language === 'JP' ? (a.sapo_jp || a.sapo_vi || '') : (a.sapo_vi || a.sapo_jp || '');
    const categoryLabel =
      language === 'JP'
        ? (a.expand?.category?.name_jp || a.expand?.category?.name_vi || a.expand?.category?.name || a.expand?.category?.slug)
        : (a.expand?.category?.name_vi || a.expand?.category?.name_jp || a.expand?.category?.name || a.expand?.category?.slug);
    const authorName = a.expand?.author?.name || a.expand?.author?.email || 'Author';
    const dateStr = a.publishedAt || (a as any).created || '';
    const date = dateStr ? new Date(dateStr).toLocaleDateString(language === 'JP' ? 'ja-JP' : 'vi-VN') : '';
    const mins = typeof a.readingMinutes === 'number' ? a.readingMinutes : 0;
    const readTime = mins > 0 ? (language === 'JP' ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : '';
    const image = getPbFileUrl(a, a.thumbnail) || '';
    return {
      id: a.slug || a.id,
      title: title || '(Untitled)',
      summary,
      category: categoryLabel || (a as any).category || 'Category',
      image,
      author: authorName,
      date,
      readTime,
    };
  }, [language, readTimeLabel]);

  const publishedSortedByTime = useMemo(() => {
    return [...(publishedItems as PublishedArticle[])].sort((a, b) => toMs(b) - toMs(a));
  }, [publishedItems, toMs]);

  const mostViewed = useMemo(() => {
    const currentId = pbArticle?.id;
    return [...(publishedItems as PublishedArticle[])]
      .sort((a, b) => {
        const av = typeof a.views === 'number' && Number.isFinite(a.views) ? a.views : 0;
        const bv = typeof b.views === 'number' && Number.isFinite(b.views) ? b.views : 0;
        if (bv !== av) return bv - av;
        return toMs(b) - toMs(a);
      })
      .filter((a) => a.id !== currentId)
      .slice(0, 5)
      .map(mapPbToCardArticle);
  }, [publishedItems, pbArticle?.id, mapPbToCardArticle, toMs]);

  const relatedCategory = useMemo(() => {
    const categoryId = pbArticle?.category || pbArticle?.expand?.category?.id;
    if (!categoryId) return [];
    return publishedSortedByTime
      .filter((a) => a.id !== pbArticle?.id && (a as any).category === categoryId)
      .slice(0, 5)
      .map(mapPbToCardArticle);
  }, [publishedItems, publishedSortedByTime, pbArticle?.category, pbArticle?.expand?.category?.id, pbArticle?.id, mapPbToCardArticle]);

  const prevNext = useMemo(() => {
    const currentId = pbArticle?.id;
    if (!currentId) return { previous: undefined as Article | undefined, next: undefined as Article | undefined };
    const idx = publishedSortedByTime.findIndex((a) => a.id === currentId);
    if (idx < 0) return { previous: undefined as Article | undefined, next: undefined as Article | undefined };
    return {
      previous: publishedSortedByTime[idx + 1] ? mapPbToCardArticle(publishedSortedByTime[idx + 1]) : undefined,
      next: publishedSortedByTime[idx - 1] ? mapPbToCardArticle(publishedSortedByTime[idx - 1]) : undefined,
    };
  }, [pbArticle?.id, publishedSortedByTime, mapPbToCardArticle]);

  useEffect(() => {
    if (!slug || !pbArticle || pbStatus !== 'published') return;
    try {
      const sidKey = 'viewer_session_id';
      let sid = sessionStorage.getItem(sidKey);
      if (!sid) {
        sid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? (crypto.randomUUID() as string)
          : String(Math.random()).slice(2) + String(Date.now());
        sessionStorage.setItem(sidKey, sid);
      }
      const articleId = pbArticle?.id || slug;
      const viewKey = `${articleId}:${sid}`;
      const onceKey = `viewed_article_${viewKey}`;
      if (sessionStorage.getItem(onceKey)) return;
      sessionStorage.setItem(onceKey, '1');
      createArticleView({ key: viewKey, articleId }).catch(() => {});
    } catch { /* ignore */ }
  }, [slug, pbStatus, pbArticle]);

  const otherCategories = useMemo(() => {
    const currentCatSlug = pbArticle?.expand?.category?.slug;
    const currentCatId = pbArticle?.category || pbArticle?.expand?.category?.id;
    return allCategories.filter((c) => {
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
          const catId = (a as any).category || a.expand?.category?.id;
          const catSlug = a.expand?.category?.slug;
          return catId === cat.id || (catSlug && catSlug === cat.slug);
        })
        .sort((a, b) => toMs(b) - toMs(a))
        .slice(0, 4)
        .map(mapPbToCardArticle);
      map.set(cat.id, catArticles);
    }
    return map;
  }, [otherCategories, publishedItems, toMs, mapPbToCardArticle]);

  if (loadingPb) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          {t('loading_article')}
        </div>
        <Footer />
      </div>
    );
  }

  if (!pbArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold">{t('not_found_article')}</h1>
          <p className="mt-4 text-muted-foreground">{t('not_found_article_desc')}</p>
          <Link
            href={localePath(locale, '/')}
            className="inline-block mt-6 px-6 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            {t('back_home')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLongform) {
    return (
      <LongformArticle
        title={pbTitle || t('no_title')}
        sapo={pbSapo || ''}
        imageUrl={pbImageUrl}
        authorName={pbAuthorName}
        dateLabel={pbDateLabel}
        categorySlug={categorySlug}
        categoryName={pbCategoryName || t('category')}
        tags={pbTags}
        articleId={pbArticle?.id || slug || 'default'}
        content={pbBlocks}
        htmlContent={(isHtmlContent || isJsonBlockContent) ? (pbContent || '') : undefined}
        otherCategories={otherCategories}
        articlesByCategory={articlesByCategory}
      />
    );
  }

  const htmlOrJson = (isHtmlContent || isJsonBlockContent) ? (pbContent || '') : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={localePath(locale, '/')} className="hover:text-primary transition-colors">
            {language === 'JP' ? 'トップ' : 'Trang chủ'}
          </Link>
          <span>/</span>
          {categorySlug && (
            <>
              <Link href={localePath(locale, `/category/${categorySlug}`)} className="hover:text-primary transition-colors">
                {pbCategoryName || t('category')}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400 line-clamp-1">{pbTitle}</span>
        </nav>

        {pbTags.length > 0 && (
          <div className="mb-6">
            <ArticleTags tags={pbTags} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <article className="min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {pbTitle || t('no_title')}
            </h1>

            {pbSapo && (
              <p className="text-lg font-semibold text-gray-700 leading-relaxed mb-6">{pbSapo}</p>
            )}

            <div className="prose prose-lg prose-gray max-w-none">
              <ArticleContent content={pbBlocks} htmlContent={htmlOrJson} />
            </div>

            <div className="mt-8 mb-4 text-right">
              <Link
                href={localePath(locale, `/author/${encodeURIComponent(pbAuthorName)}`)}
                className="font-bold text-lg text-gray-900 hover:underline hover:text-primary transition-colors"
              >
                {pbAuthorName}
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={pbTitle || ''} />
            </div>

            <div id="comments" className="mt-8">
              <CommentSection articleId={pbArticle?.id || slug || 'default'} />
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleSidebar mostViewed={mostViewed} relatedCategory={relatedCategory} />
            </div>
          </aside>
        </div>

        <div className="lg:hidden mt-8">
          <ArticleSidebar mostViewed={mostViewed} relatedCategory={relatedCategory} />
        </div>

        {otherCategories.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-10">
              <span
                className="inline-block w-2.5 h-8 rounded-sm"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)', transform: 'skewX(-15deg)' }}
              />
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                {language === 'JP' ? 'その他のジャンル' : 'CÁC CHUYÊN MỤC KHÁC'}
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
                    <Link href={localePath(locale, `/category/${cat.slug}`)} className="block group">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 hover:text-primary transition-colors">{catLabel}</h3>
                      {latest && (
                        <div className="space-y-3">
                          <div className="aspect-[3/2] overflow-hidden rounded-sm">
                            <img
                              src={latest.image || 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80'}
                              alt={latest.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => { const t = e.target as HTMLImageElement; t.src = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80'; t.onerror = null; }}
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
                          <Link key={art.id} href={localePath(locale, `/longform/${art.id}`)} className="block group">
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
}
