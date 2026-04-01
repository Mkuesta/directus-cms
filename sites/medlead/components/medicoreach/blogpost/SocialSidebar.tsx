import React from 'react';

interface SocialButtonProps {
    color: string;
    bgHover: string;
    text: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ color, bgHover, text }) => (
    <button className={`w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:${color} ${bgHover} flex items-center justify-center transition`}>
        <span className="font-bold">{text}</span>
    </button>
);

const SocialSidebar: React.FC = () => {
  return (
    <div className="sticky top-32 flex flex-col gap-4 items-center">
      <p className="text-xs font-bold text-gray-400 uppercase rotate-180 mb-2" style={{ writingMode: 'vertical-rl' }}>Share</p>

      <SocialButton color="text-[#1877F2] border-[#1877F2]" bgHover="hover:bg-blue-50 dark:hover:bg-slate-800" text="fb" />
      <SocialButton color="text-[#0A66C2] border-[#0A66C2]" bgHover="hover:bg-blue-50 dark:hover:bg-slate-800" text="in" />
      <SocialButton color="text-[#1DA1F2] border-[#1DA1F2]" bgHover="hover:bg-blue-50 dark:hover:bg-slate-800" text="tw" />

      <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-center transition">
        <span className="material-symbols-outlined text-lg">mail</span>
      </button>
    </div>
  );
};

export default SocialSidebar;
