import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="sticky top-24 space-y-8">
      {/* Quote Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-center">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-3xl">request_quote</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Get a Free Quote</h3>
          <p className="text-teal-100 text-sm mt-1">Our experts will help you build the perfect list.</p>
        </div>
        
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Email</label>
              <input 
                type="email" 
                placeholder="john@company.com" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tell us about your requirements</label>
              <textarea 
                placeholder="I need a list of vascular surgeons in Texas..." 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition h-24 resize-none text-gray-900 dark:text-white"
              ></textarea>
            </div>
            <button className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition transform active:scale-95 duration-200">
              Click Here to Submit
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Your data is secure. We never spam.</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-teal-100 dark:border-teal-900 transition-colors duration-300">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified_user</span> Why Choose Us?
        </h4>
        <ul className="space-y-3">
          {[
            { label: "95% Deliverability", text: "Guarantee on emails" },
            { label: "Strictly Verified", text: "& CASS-Certified Data" },
            { label: "Compliant", text: "with GDPR, CCPA, CAN-SPAM" },
            { label: "Customizable", text: "by 50+ Filters" },
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
              <span><strong>{item.label}</strong> {item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Other Lists */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Other Physicians Email Lists</h4>
        <ul className="space-y-2 text-sm">
          {['Cardiologist Email List', 'Neurologist Email List', 'Pediatrician Email List', 'Radiologist Email List', 'Dermatologist Email List'].map((item) => (
            <li key={item}>
              <a href="#" className="text-primary hover:text-secondary hover:underline transition block">{item}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;