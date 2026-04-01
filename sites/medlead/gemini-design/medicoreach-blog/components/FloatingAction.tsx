import React from 'react';
import { Phone } from 'lucide-react';

export const FloatingAction: React.FC = () => {
  return (
    <a href="#" className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition animate-bounce z-50">
      <Phone size={24} />
    </a>
  );
};