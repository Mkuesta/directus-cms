import Hero from '@/components/medicoreach/about/Hero';
import Journey from '@/components/medicoreach/about/Journey';
import Philosophy from '@/components/medicoreach/about/Philosophy';
import GlobalPresence from '@/components/medicoreach/about/GlobalPresence';
import Leadership from '@/components/medicoreach/about/Leadership';
import Stats from '@/components/medicoreach/about/Stats';
import CTASection from '@/components/medicoreach/about/CTASection';

export const metadata = {
  title: 'About Us',
  description: 'Empowering Healthcare Connections Since 2014. Learn about Medlead and our mission to deliver accurate healthcare data.',
};

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Journey />
      <Philosophy />
      <GlobalPresence />
      <Leadership />
      <Stats />
      <CTASection />
    </>
  );
}
