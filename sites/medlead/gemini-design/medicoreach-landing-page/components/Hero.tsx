import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#005c5c] to-teal-500 dark:from-slate-900 dark:to-teal-900 overflow-hidden transition-colors duration-300">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Delivering Excellence at Every Step of <span className="text-secondary">Healthcare Marketing</span>
            </h1>
            <p className="text-lg text-teal-50 leading-relaxed max-w-xl">
              Fuel your long-term business success by strengthening your sales pipeline with our accurate, trustworthy, and continuously refreshed B2B healthcare data.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-secondary hover:bg-green-600 text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                Get a Free Quote
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-lg px-8 py-4 rounded-full font-bold backdrop-blur-sm transition">
                View Sample Data
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDfiroCkAY8M-oJ7MuaVlG-rFC6dkQ6ON3WXD-EHxffACLuQecIaVM_cF1PCLz98YNgQgwOox3E3ynrn8Q3o3Nivl3O3FUxvT6JCT8yKAenhZgI4sPiZg0toKp-J3ENS7h5KiGIjVRyzjv_hIcHhZft465POqHV_VDQrO5YSdcxA50wiErKrN54zEuFjWn9dKjMvjumBgG93n0UWhkqaAN-zoEPe4QlEGoFf6DSFlGNBiEnnAijQwLj6OouY4vMuJhhexKN3uAdeLU",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDZVeVZe6r4mgo42sShh6SMFUJZwVLEtF5fEKymwZMGOZ9m7buGEOXQ9b91VJB1FG2tvkIyAZbxyhBygMZVGGX22YliztKzU3NRzA5sSPigU_p4eQ4WwkiU670joYt3as0QGKRRblTTYuhTnE3R3wGx8SwQzwnu62eguzuk9zYWUzk-QzvwNpVuqdCPp-jP4CkLOGHbtHzlNUQA7EAmLOWP9fpdPoPkys5nW84-u4UYtfr3hpdWsm46SN3kctzfNsbFHd64h3ss044",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAyasTySgqwvZnjqsooZ-mUrPJd4v6a--a_nVN58DTpcZdXYGhVoP8VssUyMWvQDSXIuvvuW9gcZ5AmiHJsLr0vAdx6-n4dJUWyDYY4R-7hmkHPzryrEQhtAC9i9kX9xXN13vibPbl8U-kxxPKXl7oWRtWPmoG_q9lokHTUsX1ilxhnhWzI4VG56uzsAs_pGMndorH2MNfoat86pvzDEl9CCF_k3xejGYNbJU_4ZRncGsW3m57xGHlMAuL0LyVLm248_cnskbD3xtk"
                ].map((src, i) => (
                  <img key={i} src={src} alt="User" className="w-10 h-10 rounded-full border-2 border-teal-600 object-cover" />
                ))}
              </div>
              <p className="text-white text-sm font-medium">Trusted by 5,000+ Healthcare Companies</p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvyausbq2mi4raWyO8CDFdh6uAx5GRVDA8iKiwSwABvesTsmrEihSPzPSdTU-t8xkrMvWWmyXrKrIbnxwwlPH274u-ZtRVqtZCJI6SdrqUAfEdLO25f5fehPVQloHOUR2sKbuKZMu-9SIhxZc0IoFqwdirN-G3mQkJb2Zg7iD0Ny4Cz-Z2FCtZo75I2PGyWWgnXAzs87pNBb-crajF3IpcO9CCXIRGgKjsK7Eb-V9XgCwRzsMjJWz6NWKQWOYDZtiWzkIqqHR-kzs"
                alt="Medical Team"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-6 right-6 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">95% Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;