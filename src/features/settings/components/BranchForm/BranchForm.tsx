import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { branchSchema, BranchFormData } from '@/utils/branchValidation';
import { timezones } from '@/utils/timezoneUtils';
import { Branch, Manager } from '@/types/branch';
import Toggle from '@/components/common/Toggle/Toggle';
import LoadingSpinner from '@/components/common/LoadingSpinner/LoadingSpinner';

interface BranchFormProps {
  branch?: Branch;
  managers: Manager[];
  onSubmit: (data: BranchFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  branch,
  managers,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [isActive, setIsActive] = useState(branch?.is_active ?? true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch?.name || '',
      address: branch?.address || '',
      timezone: branch?.timezone || 'America/Los_Angeles',
      contactPhone: branch?.phone || '',
      managerId: branch?.manager?.id.toString() || '',
      isActive: branch?.is_active ?? true,
    }
  });

  useEffect(() => {
    setValue('isActive', isActive);
  }, [isActive, setValue]);

  const handleFormSubmit = async (data: BranchFormData) => {
    try {
      await onSubmit({
        ...data,
        isActive
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Branch Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter branch name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          {...register('address')}
          id="address"
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
            errors.address ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter full address"
          disabled={isLoading}
        />
        {errors.address && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
          Timezone <span className="text-red-500">*</span>
        </label>
        <select
          {...register('timezone')}
          id="timezone"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.timezone ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select the timezone for this branch location
        </p>
        {errors.timezone && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.timezone.message}
          </p>
        )}
      </div>

      {/* Contact Phone */}
      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Contact Phone <span className="text-gray-500">(optional)</span>
        </label>
        <input
          {...register('contactPhone')}
          type="tel"
          id="contactPhone"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.contactPhone ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="0412 345 678 or +61 412 345 678"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Australian format: 0412 345 678 or +61 412 345 678
        </p>
        {errors.contactPhone && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.contactPhone.message}
          </p>
        )}
      </div>

      {/* Manager */}
      <div>
        <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 mb-2">
          Manager <span className="text-gray-500">(optional)</span>
        </label>
        <select
          {...register('managerId')}
          id="managerId"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={isLoading}
        >
          <option value="">Select a manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active Status */}
      <div className="pt-4 border-t border-gray-200">
        <Toggle
          checked={isActive}
          onChange={setIsActive}
          disabled={isLoading}
          label="Active"
          description="Branch will be visible to customers"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {(isLoading || isSubmitting) && <LoadingSpinner size="sm" />}
          Save
        </button>
      </div>
    </form>
  );
};

export default BranchForm;