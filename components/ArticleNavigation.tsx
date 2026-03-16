'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Article } from "@/data/mockData";
import { localePath } from "@/lib/navigation";

interface ArticleNavigationProps {
  previousArticle?: Article;
  nextArticle?: Article;
}

const ArticleNavigation = ({ previousArticle, nextArticle }: ArticleNavigationProps) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-t border-b border-border">
      {/* Previous Article */}
      <div className="flex-1">
        {previousArticle && (
          <Link
            href={localePath(locale, `/longform/${previousArticle.id}`)}
            className="group flex items-start gap-3 p-4 border border-border hover:bg-muted/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Bài trước
              </span>
              <h4 className="font-serif text-sm font-medium text-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground transition-colors">
                {previousArticle.title}
              </h4>
            </div>
          </Link>
        )}
      </div>

      {/* Next Article */}
      <div className="flex-1">
        {nextArticle && (
          <Link
            href={localePath(locale, `/longform/${nextArticle.id}`)}
            className="group flex items-start gap-3 p-4 border border-border hover:bg-muted/20 transition-colors text-right"
          >
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Bài tiếp
              </span>
              <h4 className="font-serif text-sm font-medium text-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground transition-colors">
                {nextArticle.title}
              </h4>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ArticleNavigation;
