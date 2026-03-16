'use client';

import { Search, Globe, User, Menu, X, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { usePublishedArticles } from "@/contexts/PublishedArticlesContext";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { getTagByLanguage } from "@/lib/tags";
import { localePath } from "@/lib/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type ArticleForTags = {
  tags?: unknown;
  views?: number;
};

function getTrendingTagsFromArticles(articles: ArticleForTags[], limit: number) {
  const freq = new Map<string, number>();
  const weight = new Map<string, number>();

  for (const a of articles) {
    const views = typeof a.views === "number" && Number.isFinite(a.views) ? a.views : 0;
    const tags = Array.isArray(a.tags) ? (a.tags.filter((x) => typeof x === "string") as string[]) : [];
    for (const raw of tags) {
      const tag = raw.trim();
      if (!tag) continue;
      freq.set(tag, (freq.get(tag) || 0) + 1);
      weight.set(tag, (weight.get(tag) || 0) + views);
    }
  }

  const items = Array.from(freq.keys()).map((tag) => ({
    tag,
    count: freq.get(tag) || 0,
    views: weight.get(tag) || 0,
  }));

  items.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.views !== a.views) return b.views - a.views;
    return a.tag.localeCompare(b.tag);
  });

  return items.slice(0, Math.max(0, limit)).map((x) => x.tag);
}

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { categories } = useCategories();
  const { items: articles } = usePublishedArticles();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  // Categories now only come from PocketBase (via CategoriesContext)

  const displayTags = useMemo(() => {
    const sorted = (articles as ArticleForTags[]).slice().sort((a, b) => (b.views || 0) - (a.views || 0));
    return getTrendingTagsFromArticles(sorted, 8);
  }, [articles]);


  return (
    <header className="flex flex-col w-full sticky top-0 z-50 bg-white shadow-sm">
      {/* 1. Top Row (Utility & Branding) */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between relative">

          {/* Left: Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto" key={language}>
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="font-serif text-2xl font-bold flex items-center gap-2">
                    <img
                      src="/Betonabi-Logo-Final/PNG/Betonabi-logo.png"
                      alt="Betonabi"
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <SheetClose asChild key={`${category.id}-${language}`}>
                      <Link
                        href={localePath(locale, `/category/${category.slug}`)}
                        className="py-3 px-4 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between group"
                      >
                        {getCategoryLabelByLanguage(category, language)}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <Separator className="my-6" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-start px-4">
                    <button
                      onClick={() => setLanguage(language === "VN" ? "JP" : "VN")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{language === "VN" ? "Japanese" : "Vietnamese"}</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href={localePath(locale, '/')} className="flex items-center group">
              <img
                src="/Betonabi-Logo-Final/PNG/Betonabi-logo.png"
                alt="Betonabi"
                className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: Actions (Language, Search & User) */}
          <div className="flex flex-1 items-center justify-end gap-1 md:gap-4">
            {/* Language Switcher (Desktop) */}
            <div className="hidden md:flex items-center border-r border-gray-200 pr-4 mr-2">
              <button
                onClick={() => setLanguage(language === "VN" ? "JP" : "VN")}
                className="flex items-center gap-1 hover:text-[#4d0078] transition-colors text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "VN" ? "Japanese" : "Vietnamese"}</span>
              </button>
            </div>

            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 md:w-60 z-10 flex items-center bg-white shadow-lg rounded-md overflow-hidden border border-gray-200">
                  <Input
                    autoFocus
                    placeholder={t('search') || "Tìm kiếm"}
                    className="h-9 text-sm border-0 focus-visible:ring-0 rounded-none px-3"
                    onBlur={() => setIsSearchOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value.trim()) {
                          window.location.href = localePath(locale, `/search?q=${encodeURIComponent(value.trim())}`);
                        }
                      }
                    }}
                  />
                  <div className="pr-2 cursor-pointer hover:bg-gray-100 p-1 rounded-full m-1" onClick={() => setIsSearchOpen(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-[#4d0078] transition-colors hover:bg-gray-50 rounded-full"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User/Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
                      {t("dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 text-gray-600 hover:text-[#4d0078] transition-colors flex items-center gap-2 hover:bg-gray-50 rounded-full md:rounded-md md:px-3"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:inline">{t('signIn')}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={localePath(locale, '/login')}>{t('signIn')}</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Row (Main Navigation - Desktop Only) */}
      <div className="hidden md:block bg-[#4d0078]">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center h-12">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={localePath(locale, `/category/${category.slug}`)}
                className="text-white hover:bg-[#6a1b9a] px-6 h-full flex items-center text-sm font-medium whitespace-nowrap transition-colors"
              >
                {getCategoryLabelByLanguage(category, language)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 3. Bottom Row (Trending) */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="w-full py-2 flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1 text-[#4d0078] shrink-0 font-bold text-xs md:text-sm">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="whitespace-nowrap">{t('hot_topics') || "Chủ đề nổi bật"}:</span>
            </div>
            <div className="flex items-center gap-2 py-1 overflow-x-auto scrollbar-hide mask-fade-right">
              {displayTags.length > 0 ? (
                displayTags.map((topic) => (
                  <Link
                    key={topic}
                    href={localePath(locale, `/search?q=${encodeURIComponent(topic)}`)}
                    className="shrink-0 px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold border border-[#7c3aed] text-[#7c3aed] bg-white rounded-full whitespace-nowrap hover:bg-[#7c3aed] hover:text-white transition-colors cursor-pointer"
                  >
                    #{getTagByLanguage(topic, language)}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">
                  {language === "JP" ? "注目トピックなし" : "Không có chủ đề nổi bật"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
