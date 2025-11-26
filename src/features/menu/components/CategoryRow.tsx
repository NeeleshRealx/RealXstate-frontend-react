import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Check, X, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  itemCount: number;
  active: boolean;
}

interface CategoryRowProps {
  category: Category;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, data: { name: string; sortOrder: number }) => void;
  onCancel: () => void;
  onToggleActive: (id: string) => void;
  onDelete: (category: Category) => void;
  onCloseDropdowns: () => void;
  isDropdownOpen: boolean;
  onToggleDropdown: (id: string) => void;
  onViewItems?: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onToggleActive,
  onDelete,
  onCloseDropdowns,
  isDropdownOpen,
  onToggleDropdown,
  onViewItems,
  isDragging = false,
  dragHandleProps,
}) => {
  const [editName, setEditName] = useState(category.name);
  const [editSortOrder, setEditSortOrder] = useState(category.sortOrder);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onCloseDropdowns();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, onCloseDropdowns]);

  const handleSave = () => {
    onSave(category.id, { name: editName, sortOrder: editSortOrder });
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditSortOrder(category.sortOrder);
    onCancel();
  };

  return (
    <motion.tr 
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors relative ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <td className="px-4 py-3">
        <div 
          {...dragHandleProps}
          className="cursor-move hover:bg-gray-100 p-1 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="font-medium text-gray-900">{category.name}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="number"
            min="0"
            value={editSortOrder}
            onChange={(e) => setEditSortOrder(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="text-gray-600 font-medium">{category.sortOrder}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">{category.itemCount}</span>
          {category.itemCount > 0 && onViewItems && (
            <button
              onClick={() => onViewItems(category.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Items
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(category.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              category.active ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                category.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-medium ${category.active ? 'text-green-600' : 'text-gray-500'}`}>
            {category.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 relative">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                onCloseDropdowns(); // Close other dropdowns first
                onToggleDropdown(category.id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="fixed bg-white border border-gray-200 rounded-md shadow-xl z-[99999] w-32" 
                   style={{
                     top: `${(dropdownRef.current?.getBoundingClientRect().bottom || 0) + 4}px`,
                     left: `${(dropdownRef.current?.getBoundingClientRect().right || 0) - 128}px`
                   }}>
                <button
                  onClick={() => {
                    onEdit(category.id);
                    onCloseDropdowns();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(category);
                    onCloseDropdowns();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 last:rounded-b-md"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </motion.tr>
  );
};

export default CategoryRow;
