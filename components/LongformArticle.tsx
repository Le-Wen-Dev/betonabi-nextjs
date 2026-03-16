'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ShareButtons from './ShareButtons';
import ArticleTags from './ArticleTags';
import CommentSection from './CommentSection';
import BackToTopButton from './BackToTopButton';
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { BlockContentRenderer } from "@/components/BlockRenderer";
import type { ArticleContent as ArticleContentBlock } from "@/data/articleContent";
import { localePath } from "@/lib/navigation";

/** Check if a string is valid JSON block document */
function isJsonBlockContent(raw: string): boolean {
  if (!raw || !raw.trim()) return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return true;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) return true;
    return false;
  } catch {
    return false;
  }
}

interface LongformArticleProps {
  title: string;
  sapo: string;
  imageUrl: string | null;
  authorName: string;
  dateLabel: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  articleId: string;
  content: ArticleContentBlock[];
  htmlContent?: string;
  otherCategories: Array<{ id: string; slug: string; name_vi?: string; name_jp?: string; name?: string }>;
  articlesByCategory: Map<string, Array<{ id: string; title: string; image: string }>>;
}

const LongformArticle = ({
  title,
  sapo,
  imageUrl,
  authorName,
  dateLabel,
  categorySlug,
  categoryName,
  tags,
  articleId,
  content,
  htmlContent,
  otherCategories,
  articlesByCategory,
}: LongformArticleProps) => {
  const { t, language } = useLanguage();
  const { categories: allCategories } = useCategories();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  // Detect if htmlContent is actually JSON blocks
  const isJsonContent = htmlContent ? isJsonBlockContent(htmlContent) : false;

  return (
    <>
      <Header />
      <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-red-900 selection:text-white overflow-x-hidden">
        {/* Hero Section - Full width image with title overlay */}
        <header className="relative h-[33vh] sm:h-[50vh] md:h-[70vh] lg:h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          </div>

          <div className="relative z-10 container mx-auto px-6 text-center text-white">
            <div className="inline-block mb-2 sm:mb-4 md:mb-6 px-3 py-1 sm:px-4 sm:py-1.5 border border-white/30 backdrop-blur-sm rounded-full bg-black/20 text-xs sm:text-sm font-medium tracking-wider uppercase">
              {categoryName}
            </div>
            <h1 className="font-serif text-lg sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-2 sm:mb-4 md:mb-8 drop-shadow-lg max-w-5xl mx-auto line-clamp-3 sm:line-clamp-none">
              {title}
            </h1>
          </div>
        </header>

        {/* Content Body */}
        <article className="pt-16 pb-8 px-6">
          <div className="max-w-[800px] mx-auto">
            {/* Sapo */}
            {sapo && (
              <p className="font-sans text-xl sm:text-2xl text-black font-semibold leading-relaxed mb-8">
                {sapo}
              </p>
            )}

            {/* Article Content */}
            <div className="prose prose-lg md:prose-xl prose-gray mx-auto prose-headings:font-serif prose-headings:font-bold prose-p:text-gray-800 prose-p:leading-relaxed prose-img:rounded-sm">
              {isJsonContent ? (
                /* JSON Block Content - no innerHTML */
                <BlockContentRenderer jsonContent={htmlContent} />
              ) : htmlContent ? (
                <div
                  className="[&_p]:mb-8 [&_p]:text-[1.15rem] [&_p]:md:text-[1.25rem] [&_p]:text-gray-800 [&_p]:leading-[1.8] [&_img]:w-screen [&_img]:ml-[calc(50%-50vw)] [&_img]:max-w-none [&_img]:h-auto [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-gray-900 [&_h2]:border-l-4 [&_h2]:border-red-800 [&_h2]:pl-6 [&_blockquote]:my-12 [&_blockquote]:relative [&_blockquote]:p-8 [&_blockquote]:md:p-12 [&_blockquote]:bg-gray-50 [&_blockquote]:rounded-sm"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                content.map((block, index) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={index}
                        className={`mb-8 text-[1.15rem] md:text-[1.25rem] text-gray-800 leading-[1.8] ${index === 0 ? "first-letter:text-[6.75rem] first-letter:leading-[1] first-letter:font-bold first-letter:text-[#7c3aed] first-letter:float-left first-letter:mr-3 first-letter:font-serif" : ""}`}
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === 'heading') {
                    return (
                      <h2 key={index} className="text-3xl md:text-4xl mt-16 mb-8 text-gray-900 border-l-4 border-red-800 pl-6">
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <blockquote key={index} className="my-12 relative p-8 md:p-12 bg-gray-50 rounded-sm">
                        <span className="absolute top-0 left-4 text-8xl text-red-100 font-serif leading-none select-none">"</span>
                        <p className="relative z-10 font-serif text-2xl md:text-3xl italic text-gray-800 text-center leading-relaxed">
                          {block.text}
                        </p>
                      </blockquote>
                    );
                  }
                  if (block.type === 'image') {
                    return (
                      <figure key={index} className="full-bleed my-12 relative group w-screen ml-[calc(50%-50vw)]">
                        <img
                          src={block.src}
                          alt={block.caption}
                          className="w-full h-[60vh] md:h-[80vh] object-cover"
                        />
                        {block.caption && (
                          <figcaption className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white text-center italic text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return null;
                })
              )}
            </div>

            {/* Author */}
            <div className="mt-8 mb-6 text-right">
              <p className="font-bold text-lg text-gray-900">
                <Link
                  href={localePath(locale, `/author/${encodeURIComponent(authorName)}`)}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {authorName}
                </Link>
              </p>
            </div>

            {/* Share Section */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-row items-center">
              <ShareButtons url={window.location.href} title={title} />
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="pt-4 border-t border-gray-50 mt-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">{t("tags")}</h4>
                <ArticleTags tags={tags} />
              </div>
            )}

            {/* Comments */}
            <div id="comments" className="mt-10">
              <CommentSection articleId={articleId} />
            </div>

            {/* Section: Các chuyên mục khác */}
            {otherCategories.length > 0 && (
              <section className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-10">
                  <span
                    className="inline-block w-2.5 h-8 rounded-sm"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
                      transform: "skewX(-15deg)",
                    }}
                  />
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                    {language === 'JP' ? "その他のジャンル" : "CÁC CHUYÊN MỤC KHÁC"}
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
          </div>
        </article>

        <Footer />
        <BackToTopButton />
      </div>
    </>
  );
};

export default LongformArticle;
