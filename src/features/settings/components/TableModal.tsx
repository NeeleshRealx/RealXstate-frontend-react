import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Table {
  id?: string;
  table_name: string;
  section: string;
  active: boolean;
}

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Omit<Table, 'id'>) => void;
  table?: Table | null;
  sections: string[];
}

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  table,
  sections,
}) => {
  const [formData, setFormData] = useState({
    table_name: '',
    section: '',
    active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (table) {
      setFormData({
        table_name: table.table_name,
        section: table.section,
        active: table.active,
      });
    } else {
      setFormData({
        table_name: '',
        section: '',
        active: true,
      });
    }
    setErrors({});
  }, [table, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.table_name.trim()) {
      newErrors.table_name = 'Table name is required';
    } else if (!/^[a-zA-Z0-9\-\s]+$/.test(formData.table_name)) {
      newErrors.table_name = 'Table name can only contain letters, numbers, hyphens, and spaces';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        table_name: formData.table_name.trim(),
        section: formData.section.trim(),
        active: formData.active,
      });
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {table ? 'Edit Table' : 'Add Table'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Table Name */}
          <div>
            <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
              Table Name *
            </label>
            <input
              id="tableName"
              type="text"
              value={formData.table_name}
              onChange={(e) => handleInputChange('table_name', e.target.value)}
              placeholder="Enter table name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.table_name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.table_name && (
              <p className="mt-1 text-sm text-red-600">{errors.table_name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Examples: T1, Table 1, Bar-A,VIP, Outdoor, Private Room, etc.
            </p>
          </div>

          {/* Section */}
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <input
              id="section"
              type="text"
              list="sections"
              value={formData.section}
              onChange={(e) => handleInputChange('section', e.target.value)}
              placeholder="Select or type a section"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="sections">
              {sections.map((section) => (
                <option key={section} value={section} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-gray-500">
              Examples: Main Dining, VIP Section, Outdoor Seating, Bar Area, etc.
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Active
              </label>
              <p className="text-xs text-gray-500">
                Inactive tables won't appear in the table selection screens
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('active', !formData.active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.active ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;
