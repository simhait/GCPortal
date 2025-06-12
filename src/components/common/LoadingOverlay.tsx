import React from 'react';
import { useStore } from '../../store/useStore';
import { Bot, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Cooking up your analysis..." 
}) => {
  const darkMode = useStore((state) => state.darkMode);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} opacity-75`} />
      <div className="relative flex flex-col items-center space-y-4 p-8 rounded-lg">
        <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Bot className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-bounce`} />
        </div>
        <div className="flex items-center space-x-3">
          <Loader2 className={`w-5 h-5 animate-spin ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};