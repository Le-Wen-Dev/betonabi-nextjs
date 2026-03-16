'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Article } from "@/data/mockData";
import { localePath } from "@/lib/navigation";

interface CategoryArticleItemProps {
  article: Article;
}

const CategoryArticleItem = ({ article }: CategoryArticleItemProps) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  return (
    <Link href={localePath(locale, `/longform/${article.id}`)}>
      <article className="group cursor-pointer py-6 first:pt-0">
        <div className="flex flex-col-reverse sm:flex-row gap-4 sm:gap-6">
          {/* Text Content - Left */}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-snug group-hover:underline decoration-1 underline-offset-2 transition-all">
              {article.title}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              {article.date} • {article.readTime}
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {article.summary}
            </p>
          </div>

          {/* Thumbnail - Right */}
          {article.image && (
            <div className="w-full sm:w-40 md:w-48 shrink-0">
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default CategoryArticleItem;
