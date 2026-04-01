import React from 'react';

const Leadership: React.FC = () => {
  const leaders = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Chief Executive Officer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmGQCj3R3_8VKb7OPzyVLJqFh0n4WeBN1L4kJHlvK_B3Kg6R3LYTmrUv8p8qGMPG8nqLjT9qRGR2RDN15nMFYb8gYHlA2R6FJQrOuZuQLCpb3KHdSC0ek3v9XH6I4zJg',
      bio: 'Former VP at a Fortune 500 pharma company with 20+ years in healthcare data strategy.',
      icon: 'person',
    },
    {
      name: 'James Rodriguez',
      role: 'Chief Technology Officer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnKc3zKvSWbL3CX1W_zb1v6BXMX4ETlJ6HPlJBDK8X-GqOV64U_ZWZNq7YQPVJZ3oPm6i-xHFUTHl-3NsBD2VxfL1Sg9z6y-8',
      bio: 'AI and data architecture expert who led engineering teams at three major health-tech startups.',
      icon: 'engineering',
    },
    {
      name: 'Priya Sharma',
      role: 'VP of Data Operations',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYB3l0dYz8I5EZ8_FJW8P-6nOz-xQWdQr3-V3bJ1v_5B3Rc7p6aY6pNcL7mA1X7HPMp1T4r6K0F5A',
      bio: 'Oversees our 150-person verification team and maintains our industry-leading 95% accuracy rate.',
      icon: 'database',
    },
  ];

  return (
    <section className="py-24 bg-surface-light dark:bg-surface-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Meet Our Leadership</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Industry veterans who&apos;ve built their careers at the intersection of healthcare and technology.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {leaders.map((leader, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-gray-100 dark:border-gray-700">
              <div className="relative h-72 overflow-hidden">
                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{leader.name}</h3>
                  <p className="text-teal-200 font-semibold text-sm">{leader.role}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leadership;
