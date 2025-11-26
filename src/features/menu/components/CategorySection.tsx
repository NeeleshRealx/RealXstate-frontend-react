import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import MenuItemCard from '@/features/menu/components/MenuItemCard';

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

interface Category {
  id: string;
  name: string;
  itemCount: number;
  items: MenuItem[];
}

interface CategorySectionProps {
  category: Category;
  isExpanded: boolean;
  onToggleExpanded: (categoryId: string) => void;
  onAddItem: (categoryId: string) => void;
  onToggleItemActive: (itemId: string) => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isExpanded,
  onToggleExpanded,
  onAddItem,
  onToggleItemActive,
  onEditItem,
  onDeleteItem,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      {/* Category Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {category.itemCount} items
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Reorder buttons */}
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ArrowDown className="w-4 h-4" />
          </button>
          
          {/* Add item button */}
          <button
            onClick={() => onAddItem(category.id)}
            className="p-1 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          {/* Expand/Collapse button */}
          <button
            onClick={() => onToggleExpanded(category.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Category Content */}
      {isExpanded && (
        <div>
          {category.items.length > 0 ? (
            <div>
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleActive={onToggleItemActive}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No items in this category yet</p>
              <button
                onClick={() => onAddItem(category.id)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
