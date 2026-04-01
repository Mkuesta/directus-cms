import React from 'react';
import { ArrowRight } from 'lucide-react';

export const FeaturedPost: React.FC = () => {
  return (
    <div className="mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="h-64 md:h-auto relative overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF8nTWxJ5-y8ll3VKRU0ECimFm7j_-TwDijarRiNBY7KRQOp4LyEyI94L8OZriicma0AQnf-CC9lm0w7DWDDjEarBeNx0A23Uh7sd537hSxVZJd_ma8iIN1dx7VqqZDCOOTfi9qGcL-H9nTSjw1sspaBpFwNebl3gBAXsvCy0fjAiI-jY1AH13WICxa1tnxok4JXlwc5lHcx4cjOVt17dYTDX3ubTCEosB0jjn1_w44AYNu6r0H_GT9Ha2L2AiFmrvz5qx-RNh6l4"
            alt="MedTech Future"
            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
          />
          <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
            Featured
          </div>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-primary mb-3 font-medium">
            <span className="bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">Healthcare Tech</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">Jan 15, 2025</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors">
            The Future of MedTech Lead Generation in 2025
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-base md:text-lg leading-relaxed">
            As the healthcare landscape evolves, so do the strategies for connecting with key decision-makers. Explore how AI-driven analytics, intent data, and precision targeting are reshaping medical B2B marketing.
          </p>
          <div>
            <a href="#" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-teal-700 transition shadow-sm">
              Read Article <ArrowRight className="ml-2" size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};