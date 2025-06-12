import React from 'react';
import { Utensils } from 'lucide-react';

interface LogoProps {
  className?: string;
  darkMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8", darkMode = false }) => {
  return (
    <div className="flex items-center">
      {/*
        <div className={`p-1 bg-indigo-600 rounded-md mr-2 ${className ? 'h-8 w-8' : ''}`}>
          <Utensils className="text-white" />
        </div>
      */}
      <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Global Catalog
      </span>
    </div>
  );
};