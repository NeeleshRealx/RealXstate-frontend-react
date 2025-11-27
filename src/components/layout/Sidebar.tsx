import React from 'react';
import { BarChart3, Package, Settings, User, LogOut, Scale , Brain  } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

interface SidebarProps {
  activeItem?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: string;
}

interface NavigationItem extends MenuItem {
  href: string;
}

interface ActionItem extends MenuItem {
  action: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine active item based on current location
  const getActiveItem = () => {
    if (activeItem) return activeItem;
    
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/menu')) return 'menu';
    if (path.startsWith('/orders')) return 'orders';
    if (path.startsWith('/services')) return 'services';
    if (path === '/analytics') return 'analytics';
    if (path.startsWith('/settings')) return 'settings';
    // if (path.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const currentActiveItem = getActiveItem();

  const menuItems: NavigationItem[] = [
    { id: 'orders', label: 'Lawyers', icon: Scale , href: '/orders' },
    { id: 'menu', label: 'AI', icon: Brain , href: '/menu' },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  ];

  const accountItems: (NavigationItem | ActionItem)[] = [
    // { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'logout', label: 'Logout', icon: LogOut, action: 'logout' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">RealXstate</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            MAIN
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActiveItem === item.id;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            ACCOUNT
          </div>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActiveItem === item.id;
            
            if (item.action === 'logout') {
              return (
                <div key={item.id} className="w-full">
                  <LogoutButton 
                    variant="ghost"
                    size="sm"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left text-gray-700 hover:bg-gray-50 hover:text-red-600 justify-start"
                    showConfirmation={true}
                  />
                </div>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={(item as NavigationItem).href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
