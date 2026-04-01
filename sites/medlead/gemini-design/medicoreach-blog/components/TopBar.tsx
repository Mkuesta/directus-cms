import React from 'react';
import { Phone, Mail } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-primary text-white text-xs py-2 px-4 hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <span className="flex items-center gap-1">
            <Phone size={14} /> 1-888-664-9690
          </span>
          <span className="flex items-center gap-1">
            <Mail size={14} /> sales@medicoreach.com
          </span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-green-200 transition-colors">Resources</a>
          <div className="flex space-x-2">
            <span className="cursor-pointer hover:text-green-200 transition-colors">FB</span>
            <span className="cursor-pointer hover:text-green-200 transition-colors">LI</span>
            <span className="cursor-pointer hover:text-green-200 transition-colors">TW</span>
          </div>
        </div>
      </div>
    </div>
  );
};