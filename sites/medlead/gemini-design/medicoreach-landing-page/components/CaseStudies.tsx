import React from 'react';

const CaseStudies: React.FC = () => {
  const studies = [
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD15cKBlAVTuw06otry3bN7RjASQDTANUkJa-KjFBxrLTDpn7bBX6xpuSC2jcHBSgyaa2lifuU2iVF8C_l1S7beaxPEedJO8lGSrTQ_m_tz5b4J9RHx72h6YRGLdP0-IFg0NLPNMQ-HCYIM5jvw2m_oLlnk_h0tlGJDjJhkvagmDmA4eJ4vCMztOlji0Jx90Pt_UzrzEjMuIg7Wbv53ag_rM6hixnEOCxGW2yJniU4HIcdZdpFSs6JPZ0GukTFVioY6tZ-zy2OzSYo",
      title: "How MedicoReach Boosts Leading Psychiatric Care Referrals"
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TBmNC8Ems_Dt0H069gI76AV3cfbpONmw4dZv-KKTUwGQMnKTtVtQObFu7UcVqkUTWOqGqCwbHJ3Un40J-P86FRb97g6Dw4Psp8T_cu2d0EoZ9CLEjYnfmTJK29aBknhYa289a7OBW_T6RADr9noBxMXrZxAAaXBIk--bE6JylZ9VQ67fRld-qFK8N5xx66iqE4aq0EBj8eCE-FOgGf1YIn7KO75m0uL9XkJiEVPrGVkcxUFkPKy3yLIv8M-yrBupwbrhUBayTiw",
      title: "How MedicoReach Helped a Renowned University Increase Lead Gen"
    },
    {
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANBgCbeP9gN4IzXDpKEyjXKfYKBgKHsOY1B3PD_2DLFQ44-vbTE92hnXfVHYGL3JNQt90KVXDXwLu0z5QW7C2UFtnkhZMgsJe3qk3QoAidyHV212F6iPjELaPIXi3jCcpvTuZyy_SVjKcnpNmnzVwoHJXry5QW2citydqYVFQu7RQgz7SLvTOHq8VDnjCx9KjN0QMC8L0HO0yq9GX1zdT4XV_y4HU6I4ViCzDPJe1tKQ55ai0Ian5qhf21MYuprBwyzfn0tkaPDUg",
      title: "MedicoReach Helped a Premier CME Provider Improve Outreach"
    }
  ];

  return (
    <>
      <section className="py-16 bg-white dark:bg-background-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">Our Clients Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {studies.map((study, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="overflow-hidden rounded-lg mb-4">
                  <img src={study.img} alt={`Case Study ${i + 1}`} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <h3 className="font-bold text-primary mb-2 group-hover:underline">{study.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-900 dark:to-cyan-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-bold">Ready to boost your medical sales?</h3>
            <p className="opacity-90">Get accurate data that drives growth.</p>
          </div>
          <button className="bg-secondary hover:bg-green-500 text-white font-bold py-3 px-8 rounded shadow-lg transition">
            Get Free Quote
          </button>
        </div>
      </section>
    </>
  );
};

export default CaseStudies;