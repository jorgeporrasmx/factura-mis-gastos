import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ProblemSection } from '@/components/ProblemSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { DifferentiatorsSection } from '@/components/DifferentiatorsSection';
import { BlogSection } from '@/components/BlogSection';
import { PricingSection } from '@/components/PricingSection';
import { FAQSection } from '@/components/FAQSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { CallPopup } from '@/components/CallPopup';

export default function Home() {
  return (
    <>
      <Header />
      <main role="main" aria-label="Contenido principal">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <DifferentiatorsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <BlogSection />
      </main>
      <Footer />
      <CallPopup />
    </>
  );
}
