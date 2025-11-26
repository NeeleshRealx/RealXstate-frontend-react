import React from 'react';
import { Button } from '@/components/ui/button';
import { MenuCategory } from '@/services/menuIntegrationService';

interface QuickActionButtonsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  showMenuItems: boolean;
  onToggleMenuItems: () => void;
  categories?: MenuCategory[];
  isLoading?: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  activeCategory,
  onCategoryChange,
  showMenuItems,
  onToggleMenuItems,
  categories = [],
  isLoading = false
}) => {
  // Static categories that are always available
  const staticCategories = [
    'Show Menu',
    'Popular Items',
    'Apply Discount'
  ];

  // Dynamic categories from the backend
  const dynamicCategories = categories.map(cat => cat.name);

  // Combine static and dynamic categories
  const allCategories = [...staticCategories, ...dynamicCategories];

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    if (category === 'Show Menu') {
      onToggleMenuItems();
    } else if (category !== 'Apply Discount') {
      onToggleMenuItems();
    }
  };

  return (
    <div className="flex flex-wrap gap-1">
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-xs text-gray-600">Loading categories...</span>
        </div>
      ) : (
        allCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(category)}
            className={`text-xs py-1 h-7 ${
              activeCategory === category 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category}
          </Button>
        ))
      )}
    </div>
  );
};

export default QuickActionButtons;
