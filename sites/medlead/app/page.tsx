import Hero from '@/components/medicoreach/landing/Hero';
import Partners from '@/components/medicoreach/landing/Partners';
import InfoSection from '@/components/medicoreach/landing/InfoSection';
import Marketplace from '@/components/medicoreach/landing/Marketplace';
import GlobalReach from '@/components/medicoreach/landing/GlobalReach';
import ValueProp from '@/components/medicoreach/landing/ValueProp';
import Comparison from '@/components/medicoreach/landing/Comparison';
import Stats from '@/components/medicoreach/landing/Stats';
import Testimonials from '@/components/medicoreach/landing/Testimonials';
import CaseStudies from '@/components/medicoreach/landing/CaseStudies';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Partners />
      <InfoSection />
      <Marketplace />
      <GlobalReach />
      <ValueProp />
      <Comparison />
      <Stats />
      <Testimonials />
      <CaseStudies />
    </>
  );
}
