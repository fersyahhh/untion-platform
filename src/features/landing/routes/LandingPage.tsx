import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ValuePropSection from '../components/ValuePropSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="bg-cream min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ValuePropSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
