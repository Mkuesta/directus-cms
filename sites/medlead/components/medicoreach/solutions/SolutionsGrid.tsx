import React from 'react';
import Link from 'next/link';

const solutions = [
  {
    icon: 'mail',
    title: 'Email List Solutions',
    description: 'Verified, opt-in email lists of healthcare professionals segmented by specialty, geography, and practice type. Reach the right audience with precision.',
    features: ['NPI-Verified Records', 'Specialty Targeting', '95% Deliverability'],
    href: '/email-lists',
    color: 'teal',
  },
  {
    icon: 'analytics',
    title: 'Market Intelligence',
    description: 'Actionable insights on healthcare market trends, competitor analysis, and prescriber behavior to inform your go-to-market strategy.',
    features: ['Prescriber Analytics', 'Market Sizing', 'Trend Reports'],
    href: '/contact',
    color: 'blue',
  },
  {
    icon: 'target',
    title: 'Intent Data',
    description: 'Know when healthcare decision-makers are actively researching solutions like yours. Prioritize outreach with real-time buying signals.',
    features: ['Real-Time Signals', 'Lead Scoring', 'Account Prioritization'],
    href: '/contact',
    color: 'green',
  },
  {
    icon: 'campaign',
    title: 'Campaign Services',
    description: 'End-to-end campaign management including list curation, deployment, A/B testing, and performance analytics for maximum ROI.',
    features: ['A/B Testing', 'Deliverability Optimization', 'Performance Tracking'],
    href: '/contact',
    color: 'purple',
  },
  {
    icon: 'integration_instructions',
    title: 'CRM Data Enrichment',
    description: 'Enhance your existing CRM records with up-to-date contact details, NPI numbers, affiliations, and specialty information.',
    features: ['Data Append', 'Deduplication', 'Real-Time Sync'],
    href: '/contact',
    color: 'orange',
  },
  {
    icon: 'verified_user',
    title: 'Compliance Solutions',
    description: 'Stay ahead of regulations with built-in CAN-SPAM, GDPR, and CCPA compliance tools. Every record is verified for consent.',
    features: ['GDPR Ready', 'CAN-SPAM Compliant', 'Opt-In Verified'],
    href: '/contact',
    color: 'teal',
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/30',
    icon: 'text-primary',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    icon: 'text-secondary',
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  },
};

const SolutionsGrid: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Solutions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Purpose-built tools and datasets designed to accelerate healthcare marketing and sales.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const colors = colorMap[solution.color];
            return (
              <div key={index} className="group relative flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,128,128,0.15)] transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                  <span className={`material-symbols-outlined ${colors.icon} text-3xl`}>{solution.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{solution.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow">{solution.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {solution.features.map((feature, i) => (
                    <span key={i} className={`${colors.badge} text-xs font-bold px-2.5 py-1 rounded-full`}>{feature}</span>
                  ))}
                </div>
                <Link
                  href={solution.href}
                  className="no-underline w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-primary hover:border-primary hover:text-white transition-all"
                >
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionsGrid;
