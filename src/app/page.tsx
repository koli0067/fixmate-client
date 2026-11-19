import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedServices from "@/components/home/FeaturedServices";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";

// These sections fetch fresh data from the API at request time.
export const instant = false;

export default function Home() {
  return (
    <div>
      <HeroSection></HeroSection>
      <FeaturedServices></FeaturedServices>
      <HowItWorks></HowItWorks>
      <CategoriesSection></CategoriesSection>
    </div>
  );
}
