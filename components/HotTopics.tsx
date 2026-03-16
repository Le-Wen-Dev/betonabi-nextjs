'use client';

import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";
import { usePublishedArticles } from "@/contexts/PublishedArticlesContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTagByLanguage } from "@/lib/tags";
import { localePath } from "@/lib/navigation";

type ArticleForTags = {
  tags?: unknown;
  views?: number;
};

function getTrendingTagsFromArticles(articles: ArticleForTags[], limit: number) {
  const freq = new Map<string, number>(); // count
  const weight = new Map<string, number>(); // sum views

  for (const a of articles) {
    const views = typeof a.views === "number" && Number.isFinite(a.views) ? a.views : 0;
    const tags = Array.isArray(a.tags) ? (a.tags.filter((x) => typeof x === "string") as string[]) : [];
    for (const raw of tags) {
      const tag = raw.trim();
      if (!tag) continue;
      freq.set(tag, (freq.get(tag) || 0) + 1);
      weight.set(tag, (weight.get(tag) || 0) + views);
    }
  }

  const items = Array.from(freq.keys()).map((tag) => ({
    tag,
    count: freq.get(tag) || 0,
    views: weight.get(tag) || 0,
  }));

  items.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.views !== a.views) return b.views - a.views;
    return a.tag.localeCompare(b.tag);
  });

  return items.slice(0, Math.max(0, limit)).map((x) => x.tag);
}

const HotTopics = () => {
  const { t, language } = useLanguage();
  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
  const { items, loading: isLoading, error } = usePublishedArticles();
  const hasError = !!error;
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  const displayTags = useMemo(() => {
    // Sort by views client-side, then compute top tags.
    const sorted = (items as ArticleForTags[]).slice().sort((a, b) => (b.views || 0) - (a.views || 0));
    return getTrendingTagsFromArticles(sorted, 10);
  }, [items]);

  return (
    <div className="bg-secondary border-y border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-foreground shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('hot_topics')}:</span>
          </div>
          <div className="flex items-center gap-2">
            {displayTags.length ? (
              displayTags.map((topic) => (
                <Link
                  key={topic}
                  href={localePath(locale, `/search?q=${encodeURIComponent(topic)}`)}
                  className="newspaper-tag shrink-0 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  {getTagByLanguage(topic, language)}
                </Link>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">
                {isLoading
                  ? t("loading")
                  : hasError
                    ? no("Không tải được.", "読み込めません。")
                    : no("Không có.", "ありません。")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotTopics;
