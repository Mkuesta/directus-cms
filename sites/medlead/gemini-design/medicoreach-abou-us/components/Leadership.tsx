import React from 'react';

const Leadership: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet the Leadership</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">The minds behind the data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {/* Member 1 */}
          <div className="group">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfiroCkAY8M-oJ7MuaVlG-rFC6dkQ6ON3WXD-EHxffACLuQecIaVM_cF1PCLz98YNgQgwOox3E3ynrn8Q3o3Nivl3O3FUxvT6JCT8yKAenhZgI4sPiZg0toKp-J3ENS7h5KiGIjVRyzjv_hIcHhZft465POqHV_VDQrO5YSdcxA50wiErKrN54zEuFjWn9dKjMvjumBgG93n0UWhkqaAN-zoEPe4QlEGoFf6DSFlGNBiEnnAijQwLj6OouY4vMuJhhexKN3uAdeLU" 
                alt="Sarah Johnson" 
                className="w-full h-full rounded-full object-cover border-4 border-teal-50 dark:border-teal-900 group-hover:border-primary transition duration-300" 
              />
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-primary">
                <span className="material-symbols-outlined text-sm">link</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sarah Johnson</h3>
            <p className="text-primary font-medium text-sm uppercase tracking-wide">CEO & Founder</p>
          </div>

          {/* Member 2 */}
          <div className="group">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZVeVZe6r4mgo42sShh6SMFUJZwVLEtF5fEKymwZMGOZ9m7buGEOXQ9b91VJB1FG2tvkIyAZbxyhBygMZVGGX22YliztKzU3NRzA5sSPigU_p4eQ4WwkiU670joYt3as0QGKRRblTTYuhTnE3R3wGx8SwQzwnu62eguzuk9zYWUzk-QzvwNpVuqdCPp-jP4CkLOGHbtHzlNUQA7EAmLOWP9fpdPoPkys5nW84-u4UYtfr3hpdWsm46SN3kctzfNsbFHd64h3ss044" 
                alt="David Chen" 
                className="w-full h-full rounded-full object-cover border-4 border-teal-50 dark:border-teal-900 group-hover:border-primary transition duration-300" 
              />
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-primary">
                <span className="material-symbols-outlined text-sm">link</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">David Chen</h3>
            <p className="text-primary font-medium text-sm uppercase tracking-wide">Chief Data Officer</p>
          </div>

          {/* Member 3 */}
          <div className="group">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyasTySgqwvZnjqsooZ-mUrPJd4v6a--a_nVN58DTpcZdXYGhVoP8VssUyMWvQDSXIuvvuW9gcZ5AmiHJsLr0vAdx6-n4dJUWyDYY4R-7hmkHPzryrEQhtAC9i9kX9xXN13vibPbl8U-kxxPKXl7oWRtWPmoG_q9lokHTUsX1ilxhnhWzI4VG56uzsAs_pGMndorH2MNfoat86pvzDEl9CCF_k3xejGYNbJU_4ZRncGsW3m57xGHlMAuL0LyVLm248_cnskbD3xtk" 
                alt="Emily Rodriguez" 
                className="w-full h-full rounded-full object-cover border-4 border-teal-50 dark:border-teal-900 group-hover:border-primary transition duration-300" 
              />
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-primary">
                <span className="material-symbols-outlined text-sm">link</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Emily Rodriguez</h3>
            <p className="text-primary font-medium text-sm uppercase tracking-wide">VP of Marketing</p>
          </div>

          {/* Member 4 (Hiring) */}
          <div className="group">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-teal-50 dark:border-teal-900 group-hover:border-primary transition duration-300 flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-6xl text-gray-300">person</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md text-primary">
                <span className="material-symbols-outlined text-sm">add</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Join Us</h3>
            <p className="text-primary font-medium text-sm uppercase tracking-wide">We are Hiring!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leadership;