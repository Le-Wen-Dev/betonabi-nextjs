'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import CategoryArticleItem from '@/components/CategoryArticleItem';
import CategoryPagination from '@/components/CategoryPagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublishedArticles } from '@/contexts/PublishedArticlesContext';
import { listArticles, type ArticleRecord } from '@/lib/articles';
import { getPbFileUrl } from '@/lib/pbFiles';
import type { Article } from '@/data/mockData';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { getTagByLanguage } from '@/lib/tags';
import { localePath } from '@/lib/navigation';

const PER_PAGE = 10;

function clampPage(n: number) {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

const RECENT_SEARCHES_KEY = 'betonabi_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchPage() {
  const params = useParams<{ lang: string }>();
  const locale = params?.lang || 'vi';
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items: allArticles } = usePublishedArticles();

  const q = (searchParams.get('q') || '').trim();
  const page = clampPage(Number(searchParams.get('page') || '1'));

  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const reqIdRef = useRef(0);

  const no = (vi: string, jp: string) => (language === 'JP' ? jp : vi);
  const readTimeLabel = t('readTime');

  const buildUrl = (nextQ: string, nextPage: number) => {
    const sp = new URLSearchParams();
    if (nextQ) sp.set('q', nextQ);
    sp.set('page', String(nextPage));
    return `${localePath(locale, '/search')}?${sp.toString()}`;
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const trendingTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const a of allArticles) {
      const tags = Array.isArray((a as any).tags) ? ((a as any).tags.filter((x: unknown) => typeof x === 'string') as string[]) : [];
      for (const tag of tags) {
        const trimmed = tag.trim();
        if (trimmed) freq.set(trimmed, (freq.get(trimmed) || 0) + 1);
      }
    }
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag]) => tag);
  }, [allArticles]);

  const suggestions = useMemo(() => {
    if (!input.trim() || input.length < 2) return [];
    const term = input.toLowerCase();
    const matches: { title: string; slug: string }[] = [];
    for (const a of allArticles) {
      const title = language === 'JP' ? ((a as any).title_jp || (a as any).title_vi || '') : ((a as any).title_vi || (a as any).title_jp || '');
      if (title.toLowerCase().includes(term)) {
        matches.push({ title, slug: (a as any).slug || a.id });
        if (matches.length >= 5) break;
      }
    }
    return matches;
  }, [input, allArticles, language]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    const run = async () => {
      const reqId = ++reqIdRef.current;
      if (!q) { setItems([]); setTotalPages(1); setError(null); setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const res = await listArticles({ page, perPage: PER_PAGE, status: 'published', search: q, categoryId: 'all' });
        if (reqId !== reqIdRef.current) return;
        const mapped = (res.items || []).map((a: ArticleRecord) => {
          const title = language === 'JP' ? (a.title_jp || a.title_vi || '') : (a.title_vi || a.title_jp || '');
          const summary = language === 'JP' ? (a.sapo_jp || a.sapo_vi || '') : (a.sapo_vi || a.sapo_jp || '');
          const categoryLabel = language === 'JP'
            ? ((a.expand as any)?.category?.name_jp || (a.expand as any)?.category?.name_vi || (a.expand as any)?.category?.name || (a.expand as any)?.category?.slug)
            : ((a.expand as any)?.category?.name_vi || (a.expand as any)?.category?.name_jp || (a.expand as any)?.category?.name || (a.expand as any)?.category?.slug);
          const authorName = ((a.expand as any)?.author?.name as string | undefined) || ((a.expand as any)?.author?.email as string | undefined) || 'Author';
          const dateStr = a.publishedAt || (a as any).created || '';
          const date = dateStr ? new Date(dateStr).toLocaleDateString(language === 'JP' ? 'ja-JP' : 'vi-VN') : '';
          const mins = typeof a.readingMinutes === 'number' ? a.readingMinutes : 0;
          const readTime = mins > 0 ? (language === 'JP' ? `${mins}${readTimeLabel}` : `${mins} ${readTimeLabel}`) : '';
          return {
            id: a.slug || a.id,
            title: title || '(Untitled)',
            summary,
            category: categoryLabel || 'Category',
            image: getPbFileUrl(a, a.thumbnail) || '',
            author: authorName,
            date,
            readTime,
          } satisfies Article;
        });
        setItems(mapped);
        setTotalPages(Math.max(1, res.totalPages || 1));
      } catch (err: unknown) {
        if (reqId !== reqIdRef.current) return;
        setItems([]);
        setTotalPages(1);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (reqId !== reqIdRef.current) return;
        setLoading(false);
      }
    };
    run();
  }, [q, page, language, readTimeLabel]);

  const title = useMemo(() => {
    if (!q) return no('Tìm kiếm', '検索');
    return no(`Kết quả tìm kiếm: "${q}"`, `検索結果: "${q}"`);
  }, [q, language]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQ = input.trim();
    if (nextQ) saveRecentSearch(nextQ);
    router.push(buildUrl(nextQ, 1));
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (term: string) => {
    setInput(term);
    saveRecentSearch(term);
    router.push(buildUrl(term, 1));
    setShowSuggestions(false);
  };

  const handleArticleClick = (slug: string) => {
    setShowSuggestions(false);
    router.push(localePath(locale, `/longform/${slug}`));
  };

  const onPageChange = (p: number) => {
    router.push(buildUrl(q, clampPage(p)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8" style={{ maxWidth: '1100px' }}>
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {no('Nhập từ khóa để tìm bài viết theo tiêu đề / sapo.', 'キーワードで記事（タイトル/要約）を検索します。')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('search')}
                autoComplete="off"
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button type="submit" className="sm:w-32">{no('Tìm', '検索')}</Button>
          </div>

          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 sm:right-auto sm:w-[calc(100%-8.5rem)] top-full mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">{no('Bài viết gợi ý', 'おすすめ記事')}</div>
                  {suggestions.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => handleArticleClick(s.slug)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded-sm flex items-center gap-2 transition-colors"
                    >
                      <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="line-clamp-1">{s.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && !input.trim() && (
                <div className="p-2 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {no('Tìm kiếm gần đây', '最近の検索')}
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded-sm flex items-center gap-2 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {trendingTags.length > 0 && !input.trim() && (
                <div className="p-2 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {no('Chủ đề nổi bật', '人気のトピック')}
                  </div>
                  <div className="flex flex-wrap gap-2 px-2 py-1">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSuggestionClick(tag)}
                        className="px-2 py-1 text-xs border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white rounded-sm transition-colors"
                      >
                        #{getTagByLanguage(tag, language)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!suggestions.length && !recentSearches.length && !trendingTags.length && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {no('Nhập từ khóa để tìm kiếm', 'キーワードを入力してください')}
                </div>
              )}
            </div>
          )}
        </form>

        {!q ? (
          <div className="text-sm text-muted-foreground italic">{no('Chưa có từ khóa tìm kiếm.', '検索キーワードがありません。')}</div>
        ) : loading ? (
          <div className="text-sm text-muted-foreground italic">{no('Đang tải...', '読み込み中…')}</div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">{error}</div>
        ) : items.length ? (
          <div className="divide-y divide-dotted divide-border">
            {items.map((a) => <CategoryArticleItem key={a.id} article={a} />)}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">{no('Không có kết quả.', '結果がありません。')}</div>
        )}

        {q && totalPages > 1 ? (
          <CategoryPagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        ) : null}

        <div className="mt-8 text-sm text-muted-foreground">
          <Link href={localePath(locale, '/')} className="underline hover:text-foreground">
            {no('Về trang chủ', 'ホームへ')}
          </Link>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
