import React from 'react';
import { BarChart3, ShoppingCart, Tag, AlertOctagon, Truck, Coffee } from 'lucide-react';

const Dashboard = () => {
  // Placeholder data for dashboard stats
  const stats = [
    { name: 'Total Food Items', value: '1,248', icon: Coffee, color: 'bg-blue-500' },
    { name: 'Categories', value: '32', icon: Tag, color: 'bg-green-500' },
    { name: 'Brands', value: '87', icon: ShoppingCart, color: 'bg-purple-500' },
    { name: 'Suppliers', value: '24', icon: Truck, color: 'bg-yellow-500' },
    { name: 'Allergens', value: '14', icon: AlertOctagon, color: 'bg-red-500' },
  ];

  // Placeholder data for recent activities
  const recentActivities = [
    { action: 'Added new food item', item: 'Organic Quinoa', user: 'Admin', time: '2 hours ago' },
    { action: 'Updated category', item: 'Whole Grains', user: 'Admin', time: '3 hours ago' },
    { action: 'Added new brand', item: 'Nature\'s Best', user: 'Admin', time: '5 hours ago' },
    { action: 'Updated allergen info', item: 'Almond Milk', user: 'Admin', time: '1 day ago' },
    { action: 'Added new supplier', item: 'Organic Farms Co.', user: 'Admin', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add New Item
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Recent Activity</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.map((activity, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium dark:text-white">
                        {activity.action}: <span className="font-bold">{activity.item}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Catalog Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Common Allergens</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Peanuts (124)</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Tree Nuts (98)</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Milk (87)</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Eggs (76)</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Wheat (65)</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Categories</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm dark:text-white">Fruits & Vegetables</span>
                    <span className="text-sm font-medium dark:text-white">245 items</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm dark:text-white">Grains</span>
                    <span className="text-sm font-medium dark:text-white">187 items</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm dark:text-white">Dairy</span>
                    <span className="text-sm font-medium dark:text-white">156 items</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;