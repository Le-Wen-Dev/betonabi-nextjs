'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Article } from "@/data/mockData";
import ArticleCard from "./ArticleCard";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localePath } from "@/lib/navigation";

interface CategoryBlockProps {
  title: string;
  slug: string;
  articles: Article[];
}

const CategoryBlock = ({ title, slug, articles }: CategoryBlockProps) => {
  const { language, t } = useLanguage();
  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';
  const mainArticle = articles[0];
  const listArticles = articles.slice(1);

  return (
    <div className="category-block" id={title.toLowerCase().replace(/\s+/g, "-")}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-foreground">
          {title}
        </h2>
        <Link
          href={localePath(locale, `/category/${slug}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("viewMore")}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <Separator className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Article */}
        <div>
          {mainArticle ? (
            <ArticleCard article={mainArticle} variant="vertical" showImage={true} />
          ) : (
            <div className="border border-border rounded-sm p-4 text-sm text-muted-foreground">
              {no("Không có bài viết.", "記事がありません。")}
            </div>
          )}
        </div>

        {/* List Articles */}
        <div className="space-y-1">
          {listArticles.length ? (
            listArticles.map((article, index) => (
              <div key={article.id}>
                <ArticleCard article={article} variant="compact" showImage={false} />
                {index < listArticles.length - 1 && <Separator className="my-2" />}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground italic">
              {no("Không có thêm bài viết.", "他の記事がありません。")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBlock;
