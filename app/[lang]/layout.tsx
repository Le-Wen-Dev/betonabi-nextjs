import QueryClientProvider from '@/components/QueryClientProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { PublishedArticlesProvider } from '@/contexts/PublishedArticlesContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const locales = ['vi', 'ja'];

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang === 'ja' ? 'ja' : 'vi';

  return (
    <QueryClientProvider>
      <TooltipProvider>
        <LanguageProvider locale={locale}>
          <AuthProvider>
            <CategoriesProvider>
              <PublishedArticlesProvider>
                <Toaster />
                <Sonner />
                {children}
              </PublishedArticlesProvider>
            </CategoriesProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
