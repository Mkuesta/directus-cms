import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary text-3xl">local_hospital</span>
              <span className="font-bold text-xl">Medico<span className="text-secondary">Reach</span></span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              1640 Highland Falls Dr, Ste #302,<br/>
              Leander, Texas 78641<br/>
              USA
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-secondary"><span className="material-symbols-outlined text-lg">social_leaderboard</span></a>
              <a href="#" className="hover:text-secondary">X</a>
              <a href="#" className="hover:text-secondary"><span className="material-symbols-outlined text-lg">ondemand_video</span></a>
              <a href="#" className="hover:text-secondary">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {['Home', 'About Us', 'Privacy Policy', 'Data Reseller Partnership', 'Contact Us'].map((link) => (
                <li key={link}><a href="#" className="hover:text-secondary transition">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {['Healthcare Databases', 'Case Studies', 'Glossary', 'FAQ', 'Code Lookup Tools'].map((link) => (
                <li key={link}><a href="#" className="hover:text-secondary transition">{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg mb-4">Newsletter</h4>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="sr-only">Name</label>
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-secondary text-sm"
                />
              </div>
              <div>
                <label className="sr-only">Email address</label>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-secondary text-sm"
                />
              </div>
              <button className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-2 rounded transition text-sm">
                Sign Up
              </button>
            </form>
            <div className="mt-6 flex gap-2">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-blue-500">security</span>
              </div>
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-teal-500">verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2024 MedicoReach. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button className="flex items-center gap-2 hover:text-white"><span className="material-symbols-outlined text-sm">chat</span> Send us a message</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;