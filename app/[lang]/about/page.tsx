'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { localePath } from '@/lib/navigation';

export default function AboutPage() {
  const params = useParams<{ lang: string }>();
  const locale = params?.lang || 'vi';
  const { language } = useLanguage();
  const no = (vi: string, jp: string) => (language === 'JP' ? jp : vi);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-[800px]">
        <div className="mb-10 border-b border-gray-100 pb-4 flex items-center gap-4">
          <span
            className="inline-block w-2.5 h-10 rounded-sm"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4d0078 100%)',
              transform: 'skewX(-15deg)',
            }}
          />
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {no('Về Betonabi', 'Betonabiについて')}
          </h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed text-gray-800">
          <p>
            {no(
              'Betonabi cung cấp tin tức chuyên sâu về Việt Nam trong nhiều lĩnh vực như văn hóa, kinh doanh, đời sống, du lịch, sức khỏe, với góc nhìn trung thực, khách quan. Ngoài ra, thông qua hợp tác với các đối tác, chúng tôi mang đến các nội dung phong phú về đất nước và con người Việt Nam với những hình ảnh, video chân thực.',
              'Betonabiは、文化、ビジネス、ライフ、旅行、健康といった幅広い分野において、客観的かつ誠実な視点からベトナムに関する深掘りニュースを提供しています。また、各種パートナーとの連携を通じて、リアルな写真や動画を交えながら、ベトナムという国や人々に関する魅力的なコンテンツをお届けします。'
            )}
          </p>
          <p>
            {no(
              'Nếu bạn quan tâm, vui lòng liên hệ với chúng tôi.',
              'ご興味のある方は、どうぞお気軽にお問い合わせください。'
            )}
          </p>

          <div className="pt-4">
            <Link
              href={localePath(locale, '/contact')}
              className="inline-block px-6 py-3 bg-[#7c3aed] text-white font-bold rounded-sm hover:bg-[#4d0078] transition-colors"
            >
              {no('Liên hệ', 'お問い合わせ')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
