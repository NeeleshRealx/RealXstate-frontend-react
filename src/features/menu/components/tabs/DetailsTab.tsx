import React from 'react';
import { FormField } from '@/components/common/FormField';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { ImageUpload } from '@/components/common/ImageUpload';

interface DetailsTabProps {
  data: {
    name: string;
    category: string;
    basePrice: string;
    active: boolean;
    image?: File | null;
    description: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  categories: Array<{ id: string; name: string }>;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ data, errors, onChange, categories }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Core Information */}
        <div className="space-y-6">
          <FormField label="Item Name" required error={errors.name}>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Enter item name"
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select
              value={data.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField 
            label="Base Price" 
            error={errors.basePrice}
            hint="If sizes have different prices, use Variants tab"
          >
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={data.basePrice}
                onChange={(e) => onChange('basePrice', e.target.value)}
                className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                placeholder="0.00"
              />
            </div>
          </FormField>

          <ToggleSwitch
            checked={data.active}
            onChange={(checked) => onChange('active', checked)}
            label="Active"
            description="Item will be visible to customers"
          />
        </div>

        {/* Right Column - Media and Description */}
        <div className="space-y-6">
          <FormField label="Item Image">
            <ImageUpload
              value={data.image ? URL.createObjectURL(data.image) : undefined}
              onChange={(file) => onChange('image', file)}
            />
          </FormField>

          <FormField label="Description" error={errors.description}>
            <textarea
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2 resize-none"
              placeholder="Describe your menu item..."
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}; 
