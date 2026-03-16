import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LongformSection from "@/components/LongformSection";
import CategorySection from "@/components/CategorySection";
import HomeSidebar from "@/components/HomeSidebar";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { useCategories } from "@/contexts/CategoriesContext";

const Index = () => {
  const { categories } = useCategories();

  // Get first 5 categories for display, excluding longform (has its own section)
  const displayCategories = categories
    .filter((c) => {
      const s = c.slug.toLowerCase().replace(/\s+/g, '');
      return s !== 'longform' && s !== 'long-form';
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <LongformSection />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column - Category Sections */}
            <div className="lg:col-span-8 space-y-0">
              {displayCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  hideSidebar={true}
                />
              ))}
            </div>

            {/* Right Column - Unified Sidebar */}
            <div className="lg:col-span-4 mt-6 lg:mt-0">
              <HomeSidebar />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default Index;
