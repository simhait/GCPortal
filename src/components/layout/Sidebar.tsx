import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Apple, Tag, Sliders, AlertOctagon, FileDown, Settings, Search, Database, Globe } from 'lucide-react';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/food-items', icon: Apple, label: 'Items' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/search-v1', icon: Database, label: 'Search V1' },
    { to: '/item-search-global', icon: Globe, label: 'Global Search' },
    { to: '/management', icon: Sliders, label: 'Management' },
    { to: '/import-export', icon: FileDown, label: 'Import/Export' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`${open ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full`}>
      <nav className="pt-5 px-3 h-full">
        <div className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
            >
              <Icon className={`mr-3 h-5 w-5 ${open ? '' : 'mx-auto'}`} />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;