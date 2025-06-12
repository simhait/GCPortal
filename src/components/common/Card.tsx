import React from 'react';
import { useStore } from '../../store/useStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const darkMode = useStore((state) => state.darkMode);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => {
  const darkMode = useStore((state) => state.darkMode);

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      {action}
    </div>
  );
};