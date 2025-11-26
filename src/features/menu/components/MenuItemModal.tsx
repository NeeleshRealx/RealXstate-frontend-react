import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { TabNavigation } from '@/components/common/TabNavigation';
import { DetailsTab } from './tabs/DetailsTab';
import { VariantsTab } from './tabs/VariantsTab';
import { ModifiersTab } from './tabs/ModifiersTab';
import { TagsTab } from './tabs/TagsTab';
import { AvailabilityTab } from './tabs/AvailabilityTab';
import { MoreHorizontal } from 'lucide-react';

interface MenuItemData {
  name: string;
  category: string;
  basePrice: string;
  active: boolean;
  image?: File | null;
  description: string;
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  itemData?: Partial<MenuItemData>;
  onSave?: (data: any) => void;
  categories: Array<{ id: string; name: string }>;
}

const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'variants', label: 'Variants' },
  { id: 'modifiers', label: 'Modifiers & Options' },
  { id: 'tags', label: 'Tags' },
  { id: 'availability', label: 'Availability' },
];

const initialAvailability = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
].map(day => ({
  day,
  available: true,
  periods: ['breakfast', 'lunch', 'dinner'] as ('breakfast' | 'lunch' | 'dinner')[],
  customTimes: [],
}));

export const MenuItemModal: React.FC<MenuItemModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  itemData,
  onSave,
  categories
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState<MenuItemData>({
    name: '',
    category: '',
    basePrice: '',
    active: true,
    description: '',
  });
  const [variants, setVariants] = useState<any[]>([]);
  const [modifiers, setModifiers] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>(initialAvailability);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      basePrice: '',
      active: true,
      description: '',
    });
    setVariants([]);
    setModifiers([]);
    setSelectedTags([]);
    setAvailability(initialAvailability);
    setErrors({});
    setActiveTab('details');
  };

  // Reset form when modal opens in add mode
  useEffect(() => {
    if (isOpen && !itemData) {
      resetForm();
    }
  }, [isOpen, itemData]);

  useEffect(() => {
    if (itemData) {
      setFormData({
        name: itemData.name || '',
        category: itemData.category || '',
        basePrice: itemData.basePrice || '',
        active: itemData.active ?? true,
        description: itemData.description || '',
      });
    }
  }, [itemData]);

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.basePrice && parseFloat(formData.basePrice) < 0) {
      newErrors.basePrice = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('details'); // Switch to details tab to show errors
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const menuItemData = {
        ...formData,
        variants,
        modifiers,
        selectedTags,
        availability,
      };
      
      console.log('Saving menu item:', menuItemData);
      
      if (onSave) {
        onSave(menuItemData);
      }
      
      // Reset form after successful save
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving menu item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    return formData.active ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = () => {
    return formData.active ? 'Active' : 'Inactive';
  };

  const getCategoryLabel = () => {
    const category = categories.find(cat => cat.id === formData.category);
    return category ? category.name : formData.category;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <DetailsTab
            data={formData}
            errors={errors}
            onChange={handleFormDataChange}
            categories={categories}
          />
        );
      case 'variants':
        return (
          <VariantsTab
            variants={variants}
            onChange={setVariants}
          />
        );
      case 'modifiers':
        return (
          <ModifiersTab
            modifiers={modifiers}
            onChange={setModifiers}
          />
        );
      case 'tags':
        return (
          <TagsTab
            selectedTags={selectedTags}
            availableTags={[]}
            onChange={setSelectedTags}
          />
        );
      case 'availability':
        return (
          <AvailabilityTab
            availability={availability}
            onChange={setAvailability}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'add' ? 'Add Item' : 'Edit Item'}
              </h2>
              <div className="mt-1 flex items-center text-sm text-gray-500 space-x-2">
                {formData.category && (
                  <>
                    <span>Category: {getCategoryLabel()}</span>
                    <span>•</span>
                  </>
                )}
                <span>Status: <span className={getStatusColor()}>{getStatusText()}</span></span>
              </div>
            </div>
            
            {/* <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 
