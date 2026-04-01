import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          {
            question: "Who are Vascular Surgeons?",
            answer: "Vascular surgeons are specialized healthcare professionals who are known for treating vascular conditions of arteries, veins, and the lymphatic system throughout the entire body except for the brain and the heart."
          },
          {
            question: "Can I get a sample of the email list?",
            answer: "Yes! We provide free samples so you can test the quality and accuracy of our data before making a purchase. Simply fill out the form above to request yours."
          },
          {
            question: "In what format is the mailing list available?",
            answer: "We deliver the data in easy-to-use formats such as .xls, .csv, and .txt, which are compatible with most CRM and marketing automation platforms."
          }
        ].map((item, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-900 dark:text-white">
                <span>{item.question}</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <span className="material-symbols-outlined text-primary">expand_more</span>
                </span>
              </summary>
              <div className="text-gray-600 dark:text-gray-400 mt-0 group-open:animate-fadeIn p-5 pt-0 text-sm">
                {item.answer}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;