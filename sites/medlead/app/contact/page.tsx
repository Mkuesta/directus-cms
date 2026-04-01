import Hero from '@/components/medicoreach/contact/Hero';
import ContactSection from '@/components/medicoreach/contact/ContactSection';
import SupportCards from '@/components/medicoreach/contact/SupportCards';
import TrustedBy from '@/components/medicoreach/contact/TrustedBy';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Medlead. Whether you need healthcare data, have questions, or want to discuss a partnership, our team is ready to assist.',
};

export default function ContactPage() {
  return (
    <>
      <Hero />
      <ContactSection />
      <SupportCards />
      <TrustedBy />
    </>
  );
}
