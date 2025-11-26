import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';
import CategoryRow from '@/features/menu/components/CategoryRow';
import CategoryForm from '@/features/menu/components/CategoryForm';
import DeleteCategoryModal from '@/features/menu/components/DeleteCategoryModal';
import { Modal } from '@/components/common/Modal';
import { menuService } from '@/services/menuService';
import { useBranchContext } from '@/contexts/BranchContext';
import { toast } from 'sonner';
import { MenuCategory } from '@/services/menuService';

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  itemCount: number;
  active: boolean;
}

const MenuCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // Use branch context instead of local state
  const { selectedBranch, branches, isLoadingBranches, handleBranchChange } = useBranchContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Branches are now loaded by the BranchContext

  // Load categories when branch changes
  useEffect(() => {
    if (!selectedBranch) return;
    
    // Reset form state when branch changes
    setShowAddModal(false);
    setEditingId(null);
    setSearchTerm('');
    setDeleteModal({ isOpen: false, category: null });
    setFormError(null);

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await menuService.getCategories(selectedBranch.id.toString());
        if (response.success && response.data) {
          const mappedCategories = response.data.categories.map((cat: MenuCategory) => ({
            id: cat.id,
            name: cat.name,
            sortOrder: cat.sort_order,
            itemCount: cat.item_count,
            active: cat.is_active,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [selectedBranch]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Branch change is now handled by the BranchContext

  const handleAddCategory = async (data: { name: string; sortOrder: number; isActive: boolean }) => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    try {
      // Clear any previous errors and set loading state
      setFormError(null);
      setIsCreating(true);
      
      // Auto-assign sort order if not provided or if it's 0
      const sortOrder = data.sortOrder || (categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder)) + 1 : 1);
      
      const response = await menuService.createCategory(selectedBranch.id.toString(), {
        name: data.name,
        sort_order: sortOrder,
        is_active: data.isActive,
      });

      if (response.success && response.data) {
        const newCategory: Category = {
          id: response.data.id,
          name: response.data.name,
          sortOrder: response.data.sort_order,
          itemCount: 0,
          active: response.data.is_active,
        };
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.sortOrder - b.sortOrder));
        setShowAddModal(false);
        setFormError(null);
        toast.success('Category created successfully');
      } else {
        const errorMessage = response.message || 'Failed to create category';
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      // Show the specific error message from the API
      const errorMessage = error.message || 'Failed to create category';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = (id: string) => {
    setEditingId(id);
  };

  const handleSaveCategory = async (id: string, data: { name: string; sortOrder: number }) => {
    if (!selectedBranch) return;

    try {
      // Ensure sort order is not negative
      const sortOrder = Math.max(0, data.sortOrder);
      
      const response = await menuService.updateCategory(selectedBranch.id.toString(), id, {
        name: data.name,
        sort_order: sortOrder,
      });

      if (response.success && response.data) {
        setCategories(prev => prev.map(cat =>
          cat.id === id
            ? { ...cat, name: response.data!.name, sortOrder: response.data!.sort_order }
            : cat
        ).sort((a, b) => a.sortOrder - b.sortOrder));
        setEditingId(null);
        toast.success('Category updated successfully');
      } else {
        toast.error(response.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const handleConfirmDelete = async () => {
    if (!selectedBranch || !deleteModal.category) return;

    try {
      setIsDeleting(true);
      const response = await menuService.deleteCategory(selectedBranch.id.toString(), deleteModal.category.id);

      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== deleteModal.category!.id));
        setDeleteModal({ isOpen: false, category: null });
        toast.success('Category deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, category: null });
    }
  };



  const handleToggleActive = async (id: string) => {
    if (!selectedBranch) return;

    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;

      const response = await menuService.updateCategory(selectedBranch.id.toString(), id, {
        is_active: !category.active,
      });

      if (response.success && response.data) {
        setCategories(prev => prev.map(cat =>
          cat.id === id ? { ...cat, active: response.data!.is_active } : cat
        ));
        toast.success(`Category ${response.data.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.message || 'Failed to update category status');
      }
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCloseDropdowns = () => {
    setOpenDropdownId(null);
  };

  const handleToggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetCategoryId || !selectedBranch) {
      setDraggedItem(null);
      return;
    }

    try {
      setIsReordering(true);
      
      // Get current categories and find indices
      const draggedIndex = categories.findIndex(cat => cat.id === draggedItem);
      const targetIndex = categories.findIndex(cat => cat.id === targetCategoryId);
      
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedItem(null);
        return;
      }

      // Create new order
      const newCategories = [...categories];
      const [draggedCategory] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(targetIndex, 0, draggedCategory);

      // Update sort orders
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        sortOrder: index + 1
      }));

      // Update local state immediately for better UX
      setCategories(updatedCategories);

      // Send to server
      const categoriesPayload = updatedCategories.map(cat => ({
        id: parseInt(cat.id),
        sort_order: cat.sortOrder
      }));
      const response = await menuService.reorderCategories(selectedBranch.id.toString(), categoriesPayload);

      if (response.success) {
        toast.success('Categories reordered successfully');
      } else {
        // Revert on error
        setCategories(categories);
        toast.error('Failed to reorder categories');
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      // Revert on error
      setCategories(categories);
      toast.error('Failed to reorder categories');
    } finally {
      setDraggedItem(null);
      setIsReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Navigation handlers
  const handleViewItems = (categoryId: string) => {
    // Navigate to menu items page with category filter
    window.location.href = `/menu/items?category=${categoryId}&branch=${selectedBranch?.id}`;
  };

  const handleBackToMenu = () => {
    window.location.href = '/menu';
  };

  const breadcrumbItems = [
    { label: 'Menu', path: '/menu' },
    { label: 'Categories' },
  ];

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
          <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Branches Available</h2>
          <p className="text-gray-600 mb-4">You need to create at least one branch to manage menu categories.</p>
          <button
            onClick={() => window.location.href = '/settings/branches'}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Branch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs and Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={breadcrumbItems} />
            <button
              onClick={handleBackToMenu}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Categories</h1>
              <p className="text-gray-600 mt-1">
                Organize your menu items into categories. Drag and drop to reorder.
              </p>
            </div>
            {isReordering && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm font-medium">Reordering...</span>
              </div>
            )}
          </div>
          
          {/* Branch Selector */}
          <div className="mb-6">
            <label htmlFor="branch-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch
            </label>
            <div className="relative">
              <select
                id="branch-select"
                value={selectedBranch?.id || ''}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="">Select a branch...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedBranch && (
              <div className="mt-2 text-sm text-gray-600">
                Managing categories for: <span className="font-medium">{selectedBranch.name}</span>
                {selectedBranch.address && (
                  <span className="ml-2">• {selectedBranch.address}</span>
                )}
              </div>
            )}
          </div>

          {/* Search and Actions - Only show when branch is selected */}
          {selectedBranch && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Add Category Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>
          )}
        </div>

        {/* Content - Only show when branch is selected */}
        {!selectedBranch ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Please select a branch to view and manage menu categories</p>
          </div>
        ) : (
          <>
            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading categories...</p>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                          {/* <GripVertical className="w-4 h-4 text-gray-400" /> */}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort Order
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {filteredCategories.length === 0 ? (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={6} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                  <Plus className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                                <p className="text-gray-500 mb-4">
                                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
                                </p>
                                {!searchTerm && (
                                  <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Category
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ) : (
                          filteredCategories.map((category) => (
                            <CategoryRow
                              key={category.id}
                              category={category}
                              isEditing={editingId === category.id}
                              onEdit={handleEditCategory}
                              onSave={handleSaveCategory}
                              onCancel={handleCancelEdit}
                              onToggleActive={handleToggleActive}
                              onDelete={handleDeleteCategory}
                              onCloseDropdowns={handleCloseDropdowns}
                              isDropdownOpen={openDropdownId === category.id}
                              onToggleDropdown={handleToggleDropdown}
                              onViewItems={handleViewItems}
                              isDragging={draggedItem === category.id}
                              dragHandleProps={{
                                draggable: true,
                                onDragStart: (e: React.DragEvent) => handleDragStart(e, category.id),
                                onDragOver: handleDragOver,
                                onDrop: (e: React.DragEvent) => handleDrop(e, category.id),
                                onDragEnd: handleDragEnd,
                              }}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={showAddModal} onClose={() => {
        setShowAddModal(false);
        setFormError(null);
      }} size="md">
        <CategoryForm
          onSave={handleAddCategory}
          onCancel={() => {
            setShowAddModal(false);
            setFormError(null);
          }}
          isModal={true}
          title="Add New Category"
          error={formError || undefined}
          onClearError={() => setFormError(null)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        categoryName={deleteModal.category?.name || ''}
        itemCount={deleteModal.category?.itemCount || 0}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MenuCategories;
