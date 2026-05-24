import { HeroSection } from "@/components/home/HeroSection";
import { PromosBanner } from "@/components/home/PromosBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <PromosBanner />
      <CategoryGrid />
      <FeaturedCarousel />
      <NewArrivalsSection />
      <TestimonialsCarousel />
    </main>
  );
}