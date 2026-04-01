import React from 'react';

const Testimonials: React.FC = () => {
  const reviews = [
    {
      text: "Working with MedicoReach has been transformational for our business development. Their wealth of information has helped to improve the strategies we use to approach prospects.",
      author: "Clifton Savage"
    },
    {
      text: "MedicoReach providing high-quality healthcare marketing data with excellent accuracy and segmentation. Their reliable service makes them a great choice.",
      author: "Benjamin Clark"
    },
    {
      text: "MedicoReach has made our lives so easy with fantastic results, with a 99.02% delivery rate and a 93.2% deliverability rate. Thanks again for the successful campaigns.",
      author: "Kim Carter"
    }
  ];

  return (
    <section className="py-16 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">Some Kind Words from Our Clients!</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-sm">star</span>)}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 italic">"{review.text}"</p>
              <div>
                <p className="font-bold text-primary">- {review.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;