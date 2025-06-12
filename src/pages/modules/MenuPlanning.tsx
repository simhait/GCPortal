import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Calendar, Star, ArrowRight } from 'lucide-react';

const MenuPlanning = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Menu className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Menu Planning</h1>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Take me to Menu Planning
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
              Here's what's happening with your menu planning:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-amber-700">
                <Calendar className="w-5 h-5 mr-2" />
                Next month's menu needs review
              </li>
              <li className="flex items-center text-green-700">
                <Star className="w-5 h-5 mr-2" />
                New seasonal recipes available
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>Create new menu</li>
            <li>Edit current menu</li>
            <li>Review nutritional analysis</li>
            <li>Generate production reports</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Menu Stats</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>4 active menu cycles</li>
            <li>85 recipes in rotation</li>
            <li>100% nutritional compliance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MenuPlanning;