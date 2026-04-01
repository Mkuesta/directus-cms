import React from 'react';

const FloatingButton: React.FC = () => {
  return (
    <a 
      href="#" 
      className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition animate-bounce z-50 flex items-center justify-center"
      aria-label="Call Us"
    >
      <span className="material-symbols-outlined">call</span>
    </a>
  );
};

export default FloatingButton;