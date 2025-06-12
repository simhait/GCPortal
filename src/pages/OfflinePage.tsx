import React from 'react';
import { useStore } from '../store/useStore';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflinePage = () => {
  const darkMode = useStore((state) => state.darkMode);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
            <WifiOff className={`h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <h2 className={`mt-6 text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            You're Offline
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Please check your internet connection and try again
          </p>
        </div>
        <div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;