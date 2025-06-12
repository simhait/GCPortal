import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar 
        toggleSidebar={toggleSidebar} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 overflow-auto p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;