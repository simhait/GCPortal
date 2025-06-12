import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const Accountability = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Accountability</h1>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Take me to work
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
              Welcome to the Accountability module! I've analyzed your program data and noticed a few items that might need your attention:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-amber-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                3 verification forms are pending review
              </li>
              <li className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Monthly claim report is ready for submission
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
          <ul className="space-y-2">
            <li>Review verification forms</li>
            <li>Submit monthly claim</li>
            <li>Update eligibility status</li>
            <li>Generate compliance reports</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Monthly claim submitted for previous month</li>
            <li>15 new applications processed</li>
            <li>Verification report generated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Accountability;