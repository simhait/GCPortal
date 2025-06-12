import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

const POS = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Point of Sale</h1>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Take me to Point of Sale
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">AI</span>
            </div>
          </div>
          <div>
            <p className="text-gray-700 mb-4">
              Good morning! Here's what's happening with your point of sale system today:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-green-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                Transaction volume is up 15% from last week
              </li>
              <li className="flex items-center text-amber-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                Register #2 needs attention
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>Start transaction mode</li>
            <li>View daily sales report</li>
            <li>Manage register settings</li>
            <li>Process refunds</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Today's Stats</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>785 transactions processed</li>
            <li>$2,450 in sales</li>
            <li>Average transaction time: 45s</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default POS;