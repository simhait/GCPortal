import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import Brands from './Brands';
import Suppliers from './Suppliers';
import Categories from './Categories';
import Manufacturers from './Manufacturers';

// Placeholder components for tabs that don't have dedicated pages yet
const StorageCategory = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Storage Categories</h2>
    <p className="text-gray-600 dark:text-gray-400">Storage category management coming soon...</p>
  </div>
);

const ValuationGroup = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Valuation Groups</h2>
    <p className="text-gray-600 dark:text-gray-400">Valuation group management coming soon...</p>
  </div>
);

const Management: React.FC = () => {
  const [activeTab, setActiveTab] = useState('vendors');

  const tabs = [
    { id: 'vendors', label: 'Vendors' },
    { id: 'manufacturers', label: 'Manufacturers' },
    { id: 'brands', label: 'Brands' },
    { id: 'categories', label: 'Item Categories' },
    { id: 'storage', label: 'Storage Categories' },
    { id: 'valuation', label: 'Valuation Groups' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vendors':
        return <Suppliers />;
      case 'manufacturers':
        return <Manufacturers />;
      case 'brands':
        return <Brands />;
      case 'categories':
        return <Categories />;
      case 'storage':
        return <StorageCategory />;
      case 'valuation':
        return <ValuationGroup />;
      default:
        return <Suppliers />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Management</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Management;