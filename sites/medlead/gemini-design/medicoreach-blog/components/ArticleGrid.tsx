import React from 'react';
import { FileText, Clock } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  updated: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Oncology Nurse Practitioners Email List: A Detailed Guide",
    excerpt: "Connecting with specialized nursing professionals requires accurate data. Learn how to build a targeted list for oncology outreach.",
    category: "Nurses",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOvKwnlyFNUbMuOi-NM-X8sRVZE1HGxoOQH-yd3okYrXQlr5xFLu1RQJuXDggqr46RYLdJYGNAy8erMIIfF8i_flVAb-heBKrDsBm0TW4JO0LImxFN7elMnXvA_oiexCAA6crYrI5RKaTww8NotfwNlblcxwbY-ZJv8RVxFMJfXnPB3dgaicOyDIPWL3NNApYuZrdeBJ4S3h-3k5w5ZYJ8gQ0s9yJ1HrmMpS-RMX5JGa1ZWJvpY0JWPowXQ5jwQWmLNzo6TgW3CUg",
    updated: "2 days ago"
  },
  {
    id: 2,
    title: "Top 10 States with the Highest Density of Vascular Surgeons",
    excerpt: "An analytical look at the geographic distribution of vascular surgeons in the US to help you target your sales territories.",
    category: "Physicians",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqZPZF33Wo6RidijDWEEFyXTBoLXXGq_Bp2f674MbRyXRtCV25w2c3iybdCgNpb0QYRMVkagsFeOjl5iK0_4oDhEDzpoyWiUI-8AlZPWNS2z5S3zLKytc_poFeBv-U4DfaLXgEjHh4CfUxKl00EODkdWi5Pm1P-2UBOu5FxFvr9HSwmQshpOrMaLyqCcV068Wf_Q17q7OMaP9Z1dKd5CGmv4MCkL_DySjp2iOAX_JO29RyfJJv3z8eGqQnQOgOY1bUAc5Vb6uWiiw",
    updated: "5 days ago"
  },
  {
    id: 3,
    title: "Marketing to Orthodontists: Key Channels & Messaging",
    excerpt: "Orthodontists are high-value prospects. Discover the channels that yield the best ROI when marketing dental equipment.",
    category: "Dentists",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcM04ZvqYSULBGJQn28_lhQCoGqGr_I59owzlWXdCFRjWtjFbruHWPAOEcOHp2p5_myk0_lm5wBUTzsn4QJ_PSitvqXhbr6UIzsJkYf-xmmu0haPaK0UisP9UVyOTxQjuQbhqEp4R9FpDQVh5u6jdWw-04FOAUoWTyM2joV33Se8T1mHKiESu7z0WGw1tpLDRR4ojV-ROq6Y-He6lVXlrItSfmBHiipxOJrCZcnMTWwKejd1x9RZeUE-TiepaLSbaHuFGB61DU2NY",
    updated: "1 week ago"
  },
  {
    id: 4,
    title: "Impact of Telemedicine on Software Vendor Selection",
    excerpt: "How the boom in telemedicine is changing the criteria hospitals use to select their software partners.",
    category: "Healthcare Tech",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGnjeJpSfPcTJoawlI6x6N_kXNl-2Aj5o4NQ6__sVoj--uU4cXXp130J6u3VG3TmPdOq8ziPGQ4Pza6E8ensXKafc4oX_kDPM--psoJfLRRQwjNqfY4BizWv63WPN8cBRNF2g2xfRb3XAwm-Y1bb01oZ4fG1tSL9gtpxpzw2OHz_7YsGWuI4zpPz2yca0pUDpOMAYe6qbjNJ720WRo_yFE1cDusjfLmQZy18P_VO-Ek7GgeIgDb0LaQxRMyHSz5xnxKi6ZoGRyksg",
    updated: "2 weeks ago"
  },
  {
    id: 5,
    title: "Hospital Administrators Email List: Reaching the C-Suite",
    excerpt: "Strategies for bypassing gatekeepers and delivering your value proposition directly to hospital decision makers.",
    category: "Management",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYf9VgVLuKrYCK8-wFA0wS3SSMFRD-HdzTRPXqWMZHc_zE1Jv0NZzulmPu00Q2tk7QiZI55VIaErZXjo5gFErRW2vdSjkuqkm8FKBGIfe-I8ogPzk5F0H8bnYRVShMWXMML2l3dsmteXNzrat59YW50GpBOew7_oHhcEULkMnGEW_z-G1RLxGo93sGIn5cDTNKZUVonc2OyfZndJXfPH0G2PlpC6FouvnVCdPqT1cPHzKSd09w84Sd5lvPvG_uIJhbtQW1jCNXte4",
    updated: "3 weeks ago"
  },
  {
    id: 6,
    title: "Independent Pharmacy vs. Chain: Data Segmentation Tips",
    excerpt: "Understanding the nuances in data segmentation when targeting different types of pharmacy businesses.",
    category: "Pharmacists",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUz_qKnnH8KHqrHOVoR8qvRYDhP_s8HPPuUa2G4BLiX6Mk-QhFH-xURSJ7oAhRhHunUcFPszEgTQYw1woA80s83Wsrd0tNVCJTusPXDu6RjKcvLtBJ0TL3tLHVuhCXxws8I5D1x-VvQyOc7zxL58TpFNkPEgNTXUe-HB5Em6oj-l1h1CVadRAiEYGZPsvBq_8b3OR1x1WvO1vSB-f6gGMrOVSBECVY922Hc2Yn8bxj_PVw3RqxmzxYnJ6aOXRc1YxERvyfPh4_lY0",
    updated: "1 month ago"
  }
];

export const ArticleGrid: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-primary" size={24} /> Latest Articles
        </h3>
        <div className="text-sm text-gray-500">Showing 1-6 of 42 articles</div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((article) => (
          <article key={article.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="h-48 relative overflow-hidden group">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 text-primary text-xs font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
                {article.category}
              </span>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary cursor-pointer transition">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                {article.excerpt}
              </p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> Updated: {article.updated}
                </span>
                <a href="#" className="font-semibold text-primary hover:underline">Read</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};