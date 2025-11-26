import React, { useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  hasVariants: boolean;
  active: boolean;
  updatedAt: string;
  image?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  onToggleActive: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const formatPrice = (price: number, hasVariants: boolean) => {
    // Ensure price is a valid number
    if (typeof price !== 'number' || isNaN(price)) {
      return hasVariants ? 'From $0.00' : '$0.00';
    }
    
    if (hasVariants) {
      return `From $${price.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatUpdatedTime = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffInHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Updated just now';
    } else if (diffInHours < 24) {
      return `Updated ${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Updated ${diffInDays}d ago`;
    }
  };

  return (
    <div className="flex items-center p-4 bg-white border-b border-gray-200 hover:bg-gray-50">
      {/* Item Image */}
      <div className="w-12 h-12 bg-gray-200 rounded-md mr-4 flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-md"></div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 ml-4">
            {/* Price and Variants */}
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price, item.hasVariants)}
                </span>
                {item.hasVariants && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Variants
                  </span>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <button
              onClick={() => onToggleActive(item.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                item.active ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  item.active ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>

            {/* Updated Time */}
            <div className="text-xs text-gray-400 min-w-0">
              {formatUpdatedTime(item.updatedAt)}
            </div>

            {/* More Options */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      onEdit(item.id);
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
