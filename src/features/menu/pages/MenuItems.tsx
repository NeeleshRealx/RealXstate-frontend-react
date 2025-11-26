import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Folder, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';
import CategorySection from '@/features/menu/components/CategorySection';
import { MenuItemModal } from '@/features/menu/components/MenuItemModal';
import { menuService } from '@/services/menuService';
import { useBranchContext } from '@/contexts/BranchContext';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  hasVariants: boolean;
  active: boolean;
  updatedAt: string;
  categoryId: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
  items: MenuItem[];
}

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  // Use branch context instead of local state
  const { selectedBranch, branches, isLoadingBranches, handleBranchChange } = useBranchContext();
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-az');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState<string>('');

  // Branches are now loaded by the BranchContext

  // Load data function - extracted for reuse
  const loadData = async () => {
    if (!selectedBranch) {
      console.log('No selected branch, cannot load data');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Load categories for selected branch
      const categoriesResponse = await menuService.getCategories(selectedBranch.id.toString());
      if (categoriesResponse.success && categoriesResponse.data) {
        const mappedCategories = categoriesResponse.data.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          itemCount: cat.item_count,
          items: [],
        }));
        setApiCategories(mappedCategories);
        setExpandedCategories(mappedCategories.map(cat => cat.id));
      }
      
      // Load menu items for selected branch
      const itemsResponse = await menuService.getItems(selectedBranch.id.toString());
      if (itemsResponse.success && itemsResponse.data) {
        // The API returns items grouped by categories, so we need to flatten them
        const allItems: MenuItem[] = [];
        itemsResponse.data.categories.forEach(category => {
          category.items.forEach(item => {
            console.log('Processing item:', item); // Debug log
            const mappedItem = {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: typeof item.base_price === 'string' ? parseFloat(item.base_price) : (item.base_price || 0),
              hasVariants: Boolean(item.has_variants),
              active: Boolean(item.is_active),
              updatedAt: item.updated_at || new Date().toISOString(),
              categoryId: item.category_id || '',
              image: item.image_url || '',
            };
            console.log('Mapped item:', mappedItem); // Debug log
            allItems.push(mappedItem);
          });
        });
        setMenuItems(allItems);
      }
    } catch (error) {
      console.error('Error loading menu data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when branch changes
  useEffect(() => {
    console.log('useEffect triggered for selectedBranch:', selectedBranch);
    if (!selectedBranch) {
      console.log('No selected branch, returning early');
      return;
    }
    
    // Reset filters when branch changes
    setSearchTerm('');
    setSelectedCategory('');
    setExpandedCategories([]);

    loadData();
  }, [selectedBranch]);

  // Group items by category
  const categories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    
    // Initialize categories from API data
    apiCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        itemCount: 0,
        items: [],
      });
    });

    // Filter and group items
    const filteredItems = menuItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Group items by category
    filteredItems.forEach(item => {
      const category = categoryMap.get(item.categoryId);
      if (category) {
        category.items.push(item);
        category.itemCount = category.items.length;
      }
    });

    return Array.from(categoryMap.values());
  }, [apiCategories, menuItems, searchTerm, selectedCategory]);

  // Branch change is now handled by the BranchContext

  const handleToggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExpandAll = () => {
    setExpandedCategories(categories.map(cat => cat.id));
  };

  const handleCollapseAll = () => {
    setExpandedCategories([]);
  };

  const handleAddItem = (categoryId: string) => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }
    setModalMode('add');
    setEditingItem(null);
    setSelectedCategoryForAdd(categoryId);
    setIsModalOpen(true);
  };

  const handleToggleItemActive = async (itemId: string) => {
    if (!selectedBranch) return;
    
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;
      
      const response = await menuService.updateItemStatus(selectedBranch.id.toString(), itemId, !item.active);
      
      if (response.success && response.data) {
        setMenuItems(prev => prev.map(menuItem => 
          menuItem.id === itemId ? { ...menuItem, active: response.data!.is_active } : menuItem
        ));
        toast.success(`Item ${response.data.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const handleEditItem = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      setModalMode('edit');
      setEditingItem(item);
      setIsModalOpen(true);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedBranch) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await menuService.deleteItem(selectedBranch.id.toString(), itemId);
        
        if (response.success) {
          setMenuItems(prev => prev.filter(item => item.id !== itemId));
          toast.success('Item deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.itemCount, 0);

  // Helper function to transform availability data
  const transformAvailability = (availability: any[]) => {
    return availability
      .filter(day => day.available)
      .map(day => {
        // If custom times exist, use them; otherwise use service periods
        if (day.customTimes && day.customTimes.length > 0) {
          return day.customTimes.map((time: any) => ({
            day_of_week: day.day,
            start_time: time.start,
            end_time: time.end,
            is_active: true
          }));
        } else {
          // Convert service periods to time ranges
          const timeRanges: any[] = [];
          
          if (day.periods.includes('breakfast')) {
            timeRanges.push({
              day_of_week: day.day,
              start_time: '06:00',
              end_time: '11:00',
              is_active: true
            });
          }
          
          if (day.periods.includes('lunch')) {
            timeRanges.push({
              day_of_week: day.day,
              start_time: '11:00',
              end_time: '16:00',
              is_active: true
            });
          }
          
          if (day.periods.includes('dinner')) {
            timeRanges.push({
              day_of_week: day.day,
              start_time: '16:00',
              end_time: '22:00',
              is_active: true
            });
          }
          
          // If no periods selected, use default times
          if (timeRanges.length === 0) {
            timeRanges.push({
              day_of_week: day.day,
              start_time: '09:00',
              end_time: '22:00',
              is_active: true
            });
          }
          
          return timeRanges;
        }
      })
      .flat(); // Flatten the array since some days might have multiple time ranges
  };

  const handleSaveMenuItem = async (data: any) => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    try {
      if (modalMode === 'add') {
        // Transform data to match backend format
        const transformedData = {
          name: data.name,
          description: data.description,
          base_price: parseFloat(data.basePrice),
          category_id: data.category,
          is_active: data.active,
          has_variants: data.variants && data.variants.length > 0,
          variants: data.variants?.map((variant: any) => ({
            name: variant.name,
            price: parseFloat(variant.price),
            is_active: variant.active
          })),
          modifiers: data.modifiers?.map((modifier: any) => ({
            name: modifier.name,
            is_required: modifier.required,
            max_select: modifier.maxSelect,
            is_active: true,
            options: modifier.options?.map((option: any) => ({
              name: option.name,
              extra_price: parseFloat(option.extraPrice),
              is_active: true
            }))
          })),
          tags: data.selectedTags?.map((tag: any) => tag.name),
          availability: transformAvailability(data.availability || [])
        };

        const response = await menuService.createItem(selectedBranch.id.toString(), transformedData);
        
        if (response.success && response.data) {
          // Upload image if provided
          if (data.image) {
            try {
              await menuService.uploadItemImage(
                selectedBranch.id.toString(),
                response.data.id.toString(),
                data.image
              );
              console.log('Image uploaded successfully');
            } catch (imageError) {
              console.error('Failed to upload image:', imageError);
              toast.error('Item created but image upload failed');
            }
          }
          
          toast.success('Item created successfully');
          
          // Refresh the entire data to ensure categories and item counts are updated
          await loadData();
        } else {
          toast.error(response.message || 'Failed to create item');
        }
      } else if (modalMode === 'edit' && editingItem) {
        // Transform data to match backend format
        const transformedData = {
          name: data.name,
          description: data.description,
          base_price: parseFloat(data.basePrice),
          category_id: data.category,
          is_active: data.active,
          has_variants: data.variants && data.variants.length > 0,
          // Only include image_url if no new image is being uploaded
          ...(data.image instanceof File ? {} : { image_url: editingItem.image }),
          variants: data.variants?.map((variant: any) => ({
            name: variant.name,
            price: parseFloat(variant.price),
            is_active: variant.active
          })),
          modifiers: data.modifiers?.map((modifier: any) => ({
            name: modifier.name,
            is_required: modifier.required,
            max_select: modifier.maxSelect,
            is_active: true,
            options: modifier.options?.map((option: any) => ({
              name: option.name,
              extra_price: parseFloat(option.extraPrice),
              is_active: true
            }))
          })),
          tags: data.selectedTags?.map((tag: any) => tag.name),
          availability: transformAvailability(data.availability || [])
        };

        const response = await menuService.updateItem(selectedBranch.id.toString(), editingItem.id, transformedData);
        
        if (response.success && response.data) {
          // Upload image if provided (and it's a File object, not a URL)
          if (data.image && data.image instanceof File) {
            try {
              await menuService.uploadItemImage(
                selectedBranch.id.toString(),
                editingItem.id,
                data.image
              );
              console.log('Image uploaded successfully');
            } catch (imageError) {
              console.error('Failed to upload image:', imageError);
              toast.error('Item updated but image upload failed');
            }
          }
          
          toast.success('Item updated successfully');
          
          // Refresh the entire data to ensure categories and item counts are updated
          await loadData();
        } else {
          toast.error(response.message || 'Failed to update item');
        }
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedCategoryForAdd('');
  };

  // Show loading state while branches are loading
  if (isLoadingBranches) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  // Show message if no branches available
  if (branches.length === 0) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Branches Available</h2>
          <p className="text-gray-600 mb-4">You need to create at least one branch to manage menu items.</p>
          <Link
            to="/settings/branches"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Branch
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Menu Items</h1>
          
          {/* Enhanced Branch Selector */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Branch Selection</h2>
                  <p className="text-sm text-gray-600">Choose a branch to manage its menu items</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  id="branch-select"
                  value={selectedBranch?.id || ''}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-gray-900 font-medium text-base hover:border-gray-300 cursor-pointer"
                >
                  <option value="">Select a branch to continue...</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {selectedBranch && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">
                          Managing menu for: <span className="text-blue-700">{selectedBranch.name}</span>
                        </p>
                        {selectedBranch.address && (
                          <p className="text-sm text-blue-700 mt-1">
                            📍 {selectedBranch.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active Branch
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters - Only show when branch is selected */}
          {selectedBranch && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items by name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdowns */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {apiCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-az">Name A-Z</option>
                  <option value="name-za">Name Z-A</option>
                  <option value="price-low">Price Low-High</option>
                  <option value="price-high">Price High-Low</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddItem('')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
                <Link
                  to="/menu/categories"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Manage Categories
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Content - Only show when branch is selected */}
        {!selectedBranch ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please select a branch to view and manage menu items</p>
          </div>
        ) : (
          <>
            {/* Category Sections */}
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading menu items...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No categories found for this branch</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      isExpanded={expandedCategories.includes(category.id)}
                      onToggleExpanded={handleToggleExpanded}
                      onAddItem={handleAddItem}
                      onToggleItemActive={handleToggleItemActive}
                      onEditItem={handleEditItem}
                      onDeleteItem={handleDeleteItem}
                    />
                  ))
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCollapseAll}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Collapse All
                </button>
                <button
                  onClick={handleExpandAll}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Expand All
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Showing {totalItems} of {totalItems} items
              </div>
            </div>
          </>
        )}
      </div>

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        itemData={editingItem ? {
          name: editingItem.name,
          category: editingItem.categoryId,
          basePrice: editingItem.price.toString(),
          active: editingItem.active,
          description: editingItem.description,
          // Don't pass image URL to modal - it expects File object
        } : (modalMode === 'add' && selectedCategoryForAdd ? {
          category: selectedCategoryForAdd,
          active: true,
        } : undefined)}
        onSave={handleSaveMenuItem}
        categories={apiCategories}
      />
    </div>
  );
};

export default MenuItems;
