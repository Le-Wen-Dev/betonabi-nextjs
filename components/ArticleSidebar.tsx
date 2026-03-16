'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Article } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { localePath } from "@/lib/navigation";

interface ArticleSidebarProps {
  mostViewed: Article[];
  relatedCategory: Article[];
}

const ArticleSidebar = ({ mostViewed, relatedCategory }: ArticleSidebarProps) => {
  const { language } = useLanguage();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';
  return (
    <aside className="space-y-8">
      {/* Most Viewed Widget (Xem nhiều) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-block w-2.5 h-7 rounded-sm"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)",
              transform: "skewX(-15deg)",
            }}
          />
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {language === 'VN' ? "Đọc nhiều" : "アクセスランキング"}
          </h3>
        </div>

        <div className="space-y-0 divide-y divide-gray-100">
          {mostViewed.slice(0, 8).map((article, index) => (
            <Link
              href={localePath(locale, `/longform/${article.id}`)}
              key={article.id}
              className="group relative flex items-center justify-between py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="pr-12">
                <h4 className="text-sm font-medium text-black leading-snug group-hover:text-[#7c3aed] transition-colors line-clamp-2">
                  {article.title}
                </h4>
              </div>
              <span className="absolute right-0 text-5xl font-black text-gray-100 pointer-events-none group-hover:text-[#7c3aed] transition-colors select-none">
                {index + 1}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ArticleSidebar;
