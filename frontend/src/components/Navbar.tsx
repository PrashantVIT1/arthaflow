import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import Phase2Dialog, { Phase2FeatureConfig } from './ui/Phase2Dialog';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isSidebarOpen, sidebarCollapsed }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  const notificationConfig: Phase2FeatureConfig = {
    title: 'Notifications',
    description: 'This feature is planned for Phase 2 of the project.',
    plannedFeatures: [
      'Real-time notifications',
      'Data Pipeline status updates',
      'Sales & Order alerts',
      'Report generation notifications',
      'User activity timeline',
      'System alerts',
    ],
    icon: 'info',
    buttonText: 'Close',
  };

  const getPageTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/sales': 'Sales Analytics',
      '/products': 'Products',
      '/customers': 'Customers',
      '/reports': 'Reports',
      '/developer-profile': 'Developer Profile',
      '/settings': 'Settings',
    };
    return titles[pathname] || 'Dashboard';
  };

  const getBreadcrumbs = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      return { label: segment.charAt(0).toUpperCase() + segment.slice(1), path };
    });
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${
      sidebarCollapsed ? 'left-16' : 'left-0 lg:left-64'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="hidden md:flex items-center space-x-2 ml-4">
              <span className="text-sm text-gray-500">Home</span>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  <span className="text-gray-400">/</span>
                  <span className={`text-sm ${index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>

            <h2 className="ml-4 lg:ml-8 text-xl font-semibold text-gray-800 hidden sm:block">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <div className="text-sm text-gray-500 hidden md:block">
              {format(new Date(), 'MMM dd, yyyy')}
            </div>

            <button 
              onClick={() => setShowNotificationDialog(true)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  A
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-medium text-gray-900">Admin User</p>
                    <p className="text-sm text-gray-500">admin@arthaflow.com</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Phase2Dialog
        isOpen={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        config={notificationConfig}
      />
    </nav>
  );
};

export default Navbar;
