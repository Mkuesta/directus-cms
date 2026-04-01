import React from 'react';
import Sidebar from './Sidebar';

const MainContent: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Content */}
          <div className="w-full lg:w-2/3">
            <div className="prose prose-lg prose-teal dark:prose-invert max-w-none">
              <p className="lead text-xl text-gray-600 dark:text-gray-300">
                Connect with top vascular surgeons across Canada, the UK, APAC, and EMEA. At the same time, personalizing your outreach efforts based on years of experience, hospital affiliation, specialty, job title, seniority, age, gender, and more.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                Our robust email lists for networking, sales, and marketing initiatives are compliant with regulatory standards. Don't miss out on this opportunity! Partner with MedicoReach and access the best verified healthcare data today.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6">Top Use Cases: Proven Use Cases of MedicoReach's Vascular Surgeons List</h3>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1 flex-shrink-0">check_circle</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">IT and software solution providers:</strong> Our email list of vascular surgeons is a versatile resource. It has been used to promote a wide range of solutions, from End-to-End IT support to ongoing technical support, Custom IT solutions, and medical coding.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1 flex-shrink-0">check_circle</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Healthcare technology solution providers:</strong> Promote healthcare solutions specifically beneficial for vascular surgeons. Such as endovenous laser therapy, intravascular ultrasound, 3D and 4D imaging, and more.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1 flex-shrink-0">check_circle</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Recruitment agencies:</strong> Find top talent for specialized vascular roles in hospitals and clinics worldwide.
                  </span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Tailored Vascular Surgeons Email List Features</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">Empower your business with our customizable vascular surgeons email list, an end-to-end solution that puts you in control. You choose the data fields, you connect with the right professionals.</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {['Full Name', 'Gender', 'Email Address', 'Phone Number', 'License Number', 'NAICS Code', 'Hospital Affiliation', 'Years of Experience'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="material-symbols-outlined text-primary text-sm">done</span> {feature}
                    </div>
                ))}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Tap into the Growing Demand: Lead Density by State</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">North America is the largest market for emergency general surgery in the vascular surgery segment. In the US office-based labs, vascular surgeons contributed the largest revenue share.</p>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-surface-light dark:bg-surface-dark">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">US States</th>
                      <th scope="col" className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Counts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                    {[
                        { state: "California", count: 250 },
                        { state: "Texas", count: 210, bg: true },
                        { state: "Florida", count: 190 },
                        { state: "New York", count: 180, bg: true },
                        { state: "Pennsylvania", count: 150 },
                        { state: "Illinois", count: 140, bg: true },
                    ].map((row, idx) => (
                        <tr key={idx} className={row.bg ? "bg-gray-50 dark:bg-slate-800/50" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{row.state}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right font-medium">{row.count}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Why MedicoReach Data Stands Out</h3>
              <p className="text-gray-600 dark:text-gray-300">We know that every business that acquires our vascular surgeons email list is looking for specific results. That's why we've curated a database where every data input was acquired only from dependable sources.</p>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-1/3">
            <Sidebar />
          </div>

        </div>
      </div>
    </section>
  );
};

export default MainContent;