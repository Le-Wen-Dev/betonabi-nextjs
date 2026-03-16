'use client';

import { Facebook, Linkedin, Instagram, Youtube, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategoryLabelByLanguage } from "@/lib/categories";
import { useCategories } from "@/contexts/CategoriesContext";
import { usePublishedArticles } from "@/contexts/PublishedArticlesContext";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPbFileUrl } from "@/lib/pbFiles";
import { localePath } from "@/lib/navigation";

// Custom X (Twitter) Icon
export const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom Threads Icon
export const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 192 192"
    aria-hidden="true"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.684 108.662 128.946 98.4405 129.507Z" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

const Footer = () => {
  const { t, language } = useLanguage();
  const { categories: categoriesSorted } = useCategories();
  const { items: articles } = usePublishedArticles();
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  // Get 4 latest articles for images
  const latestArticles = articles.slice(0, 4);

  // Split categories into 2 columns (4 each to include Du lịch & Sức khỏe)
  const col1Categories = categoriesSorted.slice(0, 4);
  const col2Categories = categoriesSorted.slice(4, 8);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: t("newsletter_invalid_email"), variant: "destructive" });
      return;
    }
    toast({ title: t("newsletter_success"), description: t("newsletter_success_desc") });
    setEmail("");
  };

  const no = (vi: string, jp: string) => (language === "JP" ? jp : vi);

  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200 py-10">
      <div className="container mx-auto px-4">
        {/* Row 1: Logo, Images, Categories - 5 Columns Evenly Spaced */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-6 pb-6 border-b border-gray-100">

          {/* 1. Logo */}
          <Link href={localePath(locale, '/')} className="flex items-start gap-2 group shrink-0 pt-1">
            <img
              src="/Betonabi-Logo-Final/PNG/Betonabi-logo.png"
              alt="Betonabi"
              className="h-8 w-auto"
            />
          </Link>

          {/* 2. Images */}
          <div className="flex gap-2 shrink-0">
            {latestArticles.map((article) => (
              <div key={article.id} className="h-[76px] w-[57px] shrink-0 rounded overflow-hidden border border-gray-100">
                <img
                  src={getPbFileUrl(article, article.thumbnail) || article.thumbnail || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                  alt=""
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"; }}
                />
              </div>
            ))}
          </div>

          <div className="w-full grid grid-cols-3 gap-4 lg:w-auto lg:flex lg:gap-8">
            {/* 3. Column 1 */}
            <div className="flex flex-col gap-2 min-w-0">
              {col1Categories.map((category) => (
                <Link
                  key={category.id}
                  href={localePath(locale, `/category/${category.slug}`)}
                  className="text-base text-black hover:text-[#7c3aed] transition-colors"
                >
                  {getCategoryLabelByLanguage(category, language)}
                </Link>
              ))}
            </div>

            {/* 4. Column 2 */}
            <div className="flex flex-col gap-2 min-w-0">
              {col2Categories.map((category) => (
                <Link
                  key={category.id}
                  href={localePath(locale, `/category/${category.slug}`)}
                  className="text-base text-black hover:text-[#7c3aed] transition-colors"
                >
                  {getCategoryLabelByLanguage(category, language)}
                </Link>
              ))}
            </div>

            {/* Column 3: About, Follow Us, Icons */}
            <div className="flex flex-col gap-2 min-w-0">
              <Link href={localePath(locale, '/about')} className="text-base text-black hover:text-[#7c3aed] transition-colors">
                {no("Về Betonabi", "Betonabiについて")}
              </Link>
              <Link href={localePath(locale, '/contact')} className="inline-flex items-center gap-1.5 text-base font-semibold text-white bg-[#7c3aed] hover:bg-[#4d0078] px-4 py-1.5 rounded-sm transition-colors w-fit">
                {no("Liên hệ", "お問い合わせ")}
              </Link>
              <div className="flex gap-4 items-center pt-2">
                {language === "VN" && (
                  <a href="#" className="text-black hover:text-[#7c3aed] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {language === "JP" && (
                  <a href="#" className="text-black hover:text-[#7c3aed] transition-colors">
                    <XIcon className="w-4 h-4" />
                  </a>
                )}
                <a href="#" className="text-black hover:text-[#7c3aed] transition-colors">
                  <ThreadsIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Newsletter, Management Info & Copyright - 3 Columns Evenly Spaced */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 pt-2">
          {/* Column 1: Newsletter */}
          <div className="flex flex-col items-start gap-3 w-full lg:w-auto">
            <div className="text-left space-y-1">
              <p className="text-sm font-medium">{no("Đừng bỏ lỡ tin tức quan trọng!", "重要なニュースをお見逃しなく!")}</p>
              <p className="text-xs text-gray-500">{no("Nhận tóm tắt tin tức hấp dẫn 24 giờ qua trên Betonabi", "Betonabiの過去24時間の注目ニュースをまとめてお届けします。")}</p>
            </div>
            <div className="flex gap-2 w-full max-w-sm">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer_email_placeholder")}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#7c3aed] h-9 text-sm"
              />
              <Button type="submit" onClick={handleNewsletterSubmit} className="bg-[#4d0078] hover:bg-[#7c3aed] text-white shrink-0 h-9 px-4 text-sm">
                {t("footer_subscribe_btn")}
              </Button>
            </div>
          </div>

          {/* Column 2: Management Info */}
          <div className="space-y-1.5 text-base text-black text-left">
            <p>
              <span className="font-semibold">{no("Chịu trách nhiệm quản lý nội dung:", "コンテンツ運営責任者:")}</span><br />{no("Nguyễn Thị Minh Chi", "Nguyễn Thị Minh Chi（グエン・ティ・ミン・チー） ")}
            </p>
            <p><span className="font-semibold">Tel:</span> (84) 348288561 - (81) 8072398857</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> contact@betonabi.com</p>
          </div>

          {/* Column 3: Copyright */}
          <div className="text-sm text-black text-left lg:text-right w-full lg:w-auto">
            <p className="opacity-80">
              {no("© Toàn bộ bản quyền thuộc Betonabi", "© Betonabi. All Rights Reserved.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
