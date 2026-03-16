'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTagByLanguage } from "@/lib/tags";
import { useLanguage } from "@/contexts/LanguageContext";
import { localePath } from "@/lib/navigation";

interface ArticleTagsProps {
  tags: string[];
}

const ArticleTags = ({ tags }: ArticleTagsProps) => {
  const { language } = useLanguage();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={localePath(locale, `/tag/${tag.toLowerCase()}`)}
          className="px-3 py-1.5 text-sm border border-border text-foreground hover:bg-[#7c3aed] hover:border-[#7c3aed] hover:text-white transition-colors"
        >
          #{getTagByLanguage(tag, language)}
        </Link>
      ))}
    </div>
  );
};

export default ArticleTags;
