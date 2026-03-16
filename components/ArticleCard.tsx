'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Article } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/navigation";

interface ArticleCardProps {
  article: Article;
  variant?: "horizontal" | "vertical" | "compact";
  showImage?: boolean;
}

const ArticleCard = ({ article, variant = "vertical", showImage = true }: ArticleCardProps) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  if (variant === "horizontal") {
    return (
      <Link href={localePath(locale, `/longform/${article.id}`)}>
        <article className="group cursor-pointer flex gap-4">
          {showImage && article.image && (
            <div className="w-24 h-20 shrink-0 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-black uppercase tracking-wider">
              {article.category}
            </span>
            <h3 className="newspaper-subheading text-sm mt-1 line-clamp-2 group-hover:text-muted-foreground transition-colors">
              {article.title}
            </h3>
            <p className="newspaper-meta mt-1 text-xs text-black">{article.date}</p>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={localePath(locale, `/longform/${article.id}`)}>
        <article className="group cursor-pointer py-2">
          <h4 className="text-sm font-medium text-black group-hover:text-muted-foreground transition-colors line-clamp-2">
            {article.title}
          </h4>
        </article>
      </Link>
    );
  }

  return (
    <Link href={localePath(locale, `/longform/${article.id}`)}>
      <article className="group cursor-pointer">
        {showImage && article.image && (
          <div className="aspect-[16/10] overflow-hidden mb-3">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <span className="text-xs font-semibold text-black uppercase tracking-wider">
          {article.category}
        </span>
        <h3 className={cn(
          "newspaper-subheading mt-2 group-hover:text-muted-foreground transition-colors",
          showImage ? "text-lg" : "text-base"
        )}>
          {article.title}
        </h3>
        <p className="newspaper-meta mt-2 text-sm text-black line-clamp-2">{article.summary}</p>
      </article>
    </Link>
  );
};

export default ArticleCard;
