'use client';

import React, { useState } from 'react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', jobTitle: '', message: '', _hp_field: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'contact',
          data: {
            name: formData.name,
            email: formData.email,
            company: formData.company,
            jobTitle: formData.jobTitle,
            message: formData.message,
          },
          _hp_field: formData._hp_field,
        }),
      });

      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', company: '', jobTitle: '', message: '', _hp_field: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-background-dark relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                  Thank you! Your message has been sent. We&apos;ll get back to you shortly.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  Something went wrong. Please try again or email us directly.
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">Full Name</label>
                    <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20 shadow-sm py-3 px-4 transition" placeholder="Dr. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Professional Email</label>
                    <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20 shadow-sm py-3 px-4 transition" placeholder="john@company.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="company">Company Name</label>
                    <input type="text" id="company" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20 shadow-sm py-3 px-4 transition" placeholder="Healthcare Inc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="job">Job Title</label>
                    <input type="text" id="job" value={formData.jobTitle} onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))} className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20 shadow-sm py-3 px-4 transition" placeholder="Marketing Director" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="message">How can we help?</label>
                  <textarea id="message" rows={4} required value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20 shadow-sm py-3 px-4 transition" placeholder="Tell us about your lead generation goals..."></textarea>
                </div>
                {/* Honeypot — hidden from humans, caught by bots */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <input
                    type="text"
                    name="_hp_field"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData._hp_field}
                    onChange={(e) => setFormData(prev => ({ ...prev, _hp_field: e.target.value }))}
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-primary hover:bg-teal-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Sending...' : 'Submit Request'} <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Details & Map */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Direct Contact</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-blue dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Headquarters</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">1640 Highland Falls Dr, Ste #302,<br/>Leander, Texas 78641, USA</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-blue dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined">call</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">1-888-664-9690</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am - 6pm CST</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-blue dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">Sales Email</p>
                    <a href="mailto:sales@medlead.com" className="text-primary hover:text-teal-700 font-medium mt-1 inline-block transition">sales@medlead.com</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 h-64 w-full relative group">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.634626607066!2d-97.87834508487216!3d30.58783968168694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x865b2d7162600001%3A0x7052968187864!2sMedlead!5e0!3m2!1sen!2sus!4v1629823482391!5m2!1sen!2sus" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" className="grayscale hover:grayscale-0 transition duration-500"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
