import type { Metadata } from 'next';
import { createServerPb } from '@/lib/pb-server';
import ArticlePageClient from './ArticlePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const pb = await createServerPb();
  let article = null;
  try {
    const res = await pb.collection('articles').getList(1, 1, {
      filter: `slug="${slug}" && status="published"`,
      expand: 'author,category',
    });
    article = res.items[0] || null;
  } catch { /* ignore */ }

  if (!article) return { title: 'Betonabi' };

  const isJP = lang === 'ja';
  const title = isJP
    ? ((article as any).seo_title_jp || (article as any).title_jp || (article as any).title_vi)
    : ((article as any).seo_title_vi || (article as any).title_vi);
  const description = isJP
    ? ((article as any).seo_description_jp || (article as any).sapo_jp || (article as any).sapo_vi)
    : ((article as any).seo_description_vi || (article as any).sapo_vi);

  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
    robots: (article as any).noindex === 'true' ? 'noindex,nofollow' : undefined,
    alternates: {
      canonical: (article as any).canonical_url || undefined,
      languages: { vi: `/vi/longform/${slug}`, ja: `/ja/longform/${slug}` },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  return <ArticlePageClient slug={slug} lang={lang} />;
}
