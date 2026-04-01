import Hero from '@/components/medicoreach/solutions/Hero';
import SolutionsGrid from '@/components/medicoreach/solutions/SolutionsGrid';
import Process from '@/components/medicoreach/solutions/Process';
import WhyChooseUs from '@/components/medicoreach/solutions/WhyChooseUs';
import CTASection from '@/components/medicoreach/solutions/CTASection';

export const metadata = {
  title: 'Solutions',
  description: 'Healthcare data solutions including verified email lists, market intelligence, intent data, campaign services, and CRM enrichment.',
};

export default function SolutionsPage() {
  return (
    <>
      <Hero />
      <SolutionsGrid />
      <Process />
      <WhyChooseUs />
      <CTASection />
    </>
  );
}
