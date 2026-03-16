/**
 * Converts mock data into PublishedArticle[] so they can be merged with
 * real PocketBase articles in PublishedArticlesContext.
 * Static articles use id prefix "static-" to avoid collision with PB records.
 */

import type { Article } from "./mockData";
import {
  heroArticle, subHeroArticles, latestNews, recommendedArticles,
  editorsPick, longformArticle, categoryData, hotTopicsVN as hotTopics,
  categories as categoryNames, getCategorySlug,
} from "./mockData";
import {
  heroArticleJP, subHeroArticlesJP, latestNewsJP,
  recommendedArticlesJP, editorsPickJP, longformArticleJP,
  categoryDataJP,
} from "./mockDataJP";
import { detailedArticle, mostViewedArticles, relatedCategoryArticles, relatedNewsArticles } from "./articleContent";
import {
  detailedArticleJP, mostViewedArticlesJP, relatedCategoryArticlesJP, relatedNewsArticlesJP
} from "./articleContentJP";
import type { PublishedArticle } from "@/contexts/PublishedArticlesContext";

// ── Category mapping ──────────────────────────────────────────────
const STATIC_CATEGORY_PREFIX = "static-cat-";

export type StaticCategory = {
  id: string; slug: string; name_vi: string; name_jp: string;
};

const categoryJpMap: Record<string, string> = {
  "Kinh doanh": "ビジネス", "Xã hội": "社会", "Đời sống": "ライフスタイル",
  "Du lịch - Văn hóa": "旅行・文化", "Giáo dục": "教育", "Sức khỏe": "健康",
  "Công nghệ": "テクノロジー", "Thể thao": "スポーツ", "Chính trị": "政治",
  "Văn hóa": "文化", "Du lịch": "旅行", "E-Magazine": "特集", "Longform": "特集",
};

export const staticCategories: StaticCategory[] = categoryNames.map((name) => ({
  id: `${STATIC_CATEGORY_PREFIX}${getCategorySlug(name)}`,
  slug: getCategorySlug(name),
  name_vi: name,
  name_jp: categoryJpMap[name] || name,
}));

function findStaticCategoryId(categoryName: string): string {
  return `${STATIC_CATEGORY_PREFIX}${getCategorySlug(categoryName)}`;
}

function findStaticCategoryForName(name: string): StaticCategory | undefined {
  return staticCategories.find((c) => c.name_vi === name || c.name_jp === name);
}

// ── Convert Article → PublishedArticle ────────────────────────────
let _counter = 0;
const _dateBase = new Date("2025-01-18T10:00:00Z");

function toPublishedArticle(
  a: Article,
  jpVersion: Article | undefined,
  opts: {
    featured?: boolean; editorsPick?: boolean; longform?: boolean;
    tags?: string[]; views?: number;
  } = {}
): PublishedArticle & { _isStatic: true } {
  _counter++;
  const catId = findStaticCategoryId(a.category);
  const cat = findStaticCategoryForName(a.category);
  const fakeDate = new Date(_dateBase.getTime() - _counter * 3600_000).toISOString();

  return {
    id: `static-${a.id}`,
    slug: `static-${a.id}`,
    title_vi: a.title,
    title_jp: jpVersion?.title || "",
    sapo_vi: a.summary,
    sapo_jp: jpVersion?.summary || "",
    thumbnail: a.image || undefined,
    publishedAt: fakeDate,
    created: fakeDate,
    readingMinutes: parseInt(a.readTime) || 5,
    featured: opts.featured || false,
    editorsPick: opts.editorsPick || false,
    longform: opts.longform || false,
    views: opts.views ?? Math.floor(Math.random() * 500 + 50),
    tags: opts.tags || [],
    category: catId,
    expand: {
      category: {
        id: catId,
        slug: cat?.slug || getCategorySlug(a.category),
        name_vi: cat?.name_vi || a.category,
        name_jp: cat?.name_jp || categoryJpMap[a.category] || a.category,
      },
      author: {
        name: a.author,
        email: `${a.author.toLowerCase().replace(/\s+/g, ".")}@betonabi.com`,
      },
    },
    _isStatic: true,
  } as PublishedArticle & { _isStatic: true };
}

// ── Build the full static articles list ───────────────────────────

function buildStaticArticles(): (PublishedArticle & { _isStatic: true })[] {
  _counter = 0;
  const result: (PublishedArticle & { _isStatic: true })[] = [];
  const added = new Set<string>();

  const add = (a: Article, jp: Article | undefined, opts = {} as Parameters<typeof toPublishedArticle>[2]) => {
    const key = `static-${a.id}`;
    if (added.has(key)) return;
    added.add(key);
    result.push(toPublishedArticle(a, jp, opts));
  };

  // Hero (featured)
  add(heroArticle, heroArticleJP, { featured: true, tags: hotTopics.slice(0, 3), views: 1200 });

  // Sub-hero
  subHeroArticles.forEach((a, i) => {
    add(a, subHeroArticlesJP[i], { featured: i === 0, tags: hotTopics.slice(1, 4), views: 800 - i * 100 });
  });

  // Latest news
  latestNews.forEach((a, i) => {
    add(a, latestNewsJP[i], { tags: [hotTopics[i % hotTopics.length]], views: 600 - i * 50 });
  });

  // Recommended
  recommendedArticles.forEach((a, i) => {
    add(a, recommendedArticlesJP[i], { tags: [hotTopics[(i + 2) % hotTopics.length]], views: 400 - i * 30 });
  });

  // Editor's pick
  editorsPick.forEach((a, i) => {
    add(a, editorsPickJP[i], { editorsPick: true, tags: hotTopics.slice(0, 2), views: 950 });
  });

  // Longform
  add(longformArticle, longformArticleJP, { longform: true, tags: ["#Du_lịch_Xuân", "#E-Magazine"], views: 1500 });

  // Category articles (includes Longform category)
  for (const [catName, articles] of Object.entries(categoryData)) {
    const jpArticles = categoryDataJP[catName] || [];
    articles.forEach((a) => {
      const jp = jpArticles.find((j) => j.id === a.id);
      add(a, jp, { views: Math.floor(Math.random() * 300 + 30) });
    });
  }

  // Extra articles from articleContent.ts with Japanese versions
  mostViewedArticles.forEach((a, i) => add(a, mostViewedArticlesJP[i], { views: Math.floor(Math.random() * 800 + 200) }));
  relatedCategoryArticles.forEach((a, i) => add(a, relatedCategoryArticlesJP[i], { views: Math.floor(Math.random() * 400 + 50) }));
  relatedNewsArticles.forEach((a, i) => add(a, relatedNewsArticlesJP[i], { views: Math.floor(Math.random() * 500 + 100) }));

  return result;
}

// Singleton – computed once
let _cached: (PublishedArticle & { _isStatic: true })[] | null = null;

export function getStaticArticles(): PublishedArticle[] {
  if (!_cached) _cached = buildStaticArticles();
  return _cached;
}

/** Check if an article id belongs to static mock data. */
export function isStaticArticleId(id: string): boolean {
  return id.startsWith("static-");
}

/** Find a static article by its slug (which equals its id for static articles). */
export function getStaticArticleBySlug(slug: string): PublishedArticle | null {
  const articles = getStaticArticles();
  return articles.find((a) => a.slug === slug || a.id === slug) || null;
}

/** Get the detailed article content for a static article (uses detailedArticle as template). */
export function getStaticArticleDetail(slug: string) {
  const article = getStaticArticleBySlug(slug);
  if (!article) return null;

  // Generate content from Vietnamese version
  const contentVi = detailedArticle.content
    .map((block) => {
      if (block.type === "paragraph") return `<p>${block.text}</p>`;
      if (block.type === "image")
        return `<figure><img src="${block.src}" alt="${block.caption || ""}" /><figcaption>${block.caption || ""}</figcaption></figure>`;
      if (block.type === "quote")
        return `<blockquote>${block.text}</blockquote>`;
      return "";
    })
    .join("\n");

  // Generate content from Japanese version
  const contentJp = detailedArticleJP.content
    .map((block) => {
      if (block.type === "paragraph") return `<p>${block.text}</p>`;
      if (block.type === "image")
        return `<figure><img src="${block.src}" alt="${block.caption || ""}" /><figcaption>${block.caption || ""}</figcaption></figure>`;
      if (block.type === "quote")
        return `<blockquote>${block.text}</blockquote>`;
      return "";
    })
    .join("\n");

  return {
    ...article,
    content_vi: contentVi,
    content_jp: contentJp,
    tags: detailedArticle.tags,
    location: detailedArticle.location,
  };
}
