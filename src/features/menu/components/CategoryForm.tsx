import React, { useState } from 'react';

interface CategoryFormProps {
  onSave: (data: { name: string; sortOrder: number; isActive: boolean }) => void;
  onCancel: () => void;
  isModal?: boolean;
  title?: string;
  error?: string;
  onClearError?: () => void;
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSave, onCancel, isModal = false, title = "Add Category", error, onClearError, isLoading = false }) => {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({ name: name.trim(), sortOrder, isActive });
      setName('');
      setSortOrder(0);
      setIsActive(true);
    }
  };

  const handleCancel = () => {
    setName('');
    setSortOrder(0);
    setIsActive(true);
    setErrors({});
    onCancel();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={isModal ? "space-y-6" : "flex items-end gap-4"}>
      <div className={isModal ? "space-y-4" : "flex-1"}>
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error && onClearError) {
                onClearError();
              }
            }}
            placeholder="Enter category name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div className={isModal ? "grid grid-cols-2 gap-4" : ""}>
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              id="sortOrder"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isActive ? 'Category will be visible to customers' : 'Category will be hidden from customers'}
            </p>
          </div>
        </div>
      </div>
      
      <div className={isModal ? "flex justify-end gap-3 pt-4 border-t" : "flex gap-2"}>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isModal ? 'Creating...' : 'Saving...'}
            </div>
          ) : (
            isModal ? 'Create Category' : 'Save'
          )}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {/* <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button> */}
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {formContent}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      {formContent}
    </div>
  );
};

export default CategoryForm;
