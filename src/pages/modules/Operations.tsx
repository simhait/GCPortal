import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

const Operations = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <BarChart2 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Operations</h1>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Take me to Operations
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
              Here's your operational overview:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-green-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                Meal participation up 8% this week
              </li>
              <li className="flex items-center text-amber-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                Labor costs trending above target
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>Review financial reports</li>
            <li>Analyze participation trends</li>
            <li>Monitor labor metrics</li>
            <li>Generate operational reports</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Key Metrics</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Revenue: $12,500 today</li>
            <li>MPLH: 18.5</li>
            <li>Food cost: 42%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Operations;