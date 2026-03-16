'use client';

import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { useCategories } from "@/contexts/CategoriesContext";
import { localePath } from "@/lib/navigation";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, t } = useLanguage();
  const { categories, loading } = useCategories();
  const categoriesSorted = useMemo(() => categories, [categories]);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  if (loading || !categoriesSorted.length) {
    return (
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-center py-3 text-sm text-muted-foreground">
            ...
          </div>
          <div className="md:hidden flex items-center justify-between py-3">
            <span className="text-sm font-medium text-foreground">{t('category')}</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center">
          {categoriesSorted.map((category, index) => (
            <Link
              key={category.id}
              href={localePath(locale, `/category/${category.slug}`)}
              className="nav-link"
            >
              {getCategoryLabelByLanguage(category, language)}
              {index < categoriesSorted.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-px bg-border" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-3">
          <span className="text-sm font-medium text-foreground">{t('category')}</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            {categoriesSorted.map((category) => (
              <Link
                key={category.id}
                href={localePath(locale, `/category/${category.slug}`)}
                className="block py-2 px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {getCategoryLabelByLanguage(category, language)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
