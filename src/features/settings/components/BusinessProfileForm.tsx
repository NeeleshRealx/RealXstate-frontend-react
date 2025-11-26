import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must be less than 100 characters'),
  businessSlug: z.string().min(2, 'Slug must be at least 2 characters').max(50, 'Slug must be less than 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().optional(),
});

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

interface BusinessProfileFormProps {
  initialData?: Partial<BusinessProfileFormData>;
  onSubmit: (data: BusinessProfileFormData & { logoFile?: File }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Utility functions
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const validateSlugAvailability = async (slug: string): Promise<boolean> => {
  // Mock validation - in real app, this would check against API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(slug !== 'taken-slug');
    }, 500);
  });
};

const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: initialData?.businessName || '',
      businessSlug: initialData?.businessSlug || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
    }
  });

  const watchedBusinessName = watch('businessName');
  const watchedBusinessSlug = watch('businessSlug');

  // Auto-generate slug from business name
  useEffect(() => {
    if (autoGenerateSlug && watchedBusinessName) {
      const newSlug = generateSlug(watchedBusinessName);
      setValue('businessSlug', newSlug);
    }
  }, [watchedBusinessName, autoGenerateSlug, setValue]);

  // Check slug availability
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!watchedBusinessSlug || watchedBusinessSlug.length < 2) {
        setSlugAvailable(null);
        return;
      }

      setSlugChecking(true);
      try {
        const isAvailable = await validateSlugAvailability(watchedBusinessSlug);
        setSlugAvailable(isAvailable);
        
        if (!isAvailable) {
          setError('businessSlug', {
            type: 'manual',
            message: 'This slug is already taken'
          });
        } else {
          clearErrors('businessSlug');
        }
      } catch (error) {
        console.error('Error checking slug availability:', error);
      } finally {
        setSlugChecking(false);
      }
    };

    const timeoutId = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedBusinessSlug, setError, clearErrors]);

  const handleFormSubmit = async (data: BusinessProfileFormData) => {
    try {
      await onSubmit({
        ...data,
        logoFile: logoFile || undefined
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    setLogoFile(file);
    setLogoError('');
  };

  const handleFileRemove = () => {
    setLogoFile(null);
    setLogoError('');
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoGenerateSlug(false);
    setValue('businessSlug', e.target.value);
  };

  const handleAutoGenerateSlug = () => {
    setAutoGenerateSlug(true);
    const newSlug = generateSlug(watchedBusinessName);
    setValue('businessSlug', newSlug);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('businessName')}
              type="text"
              id="businessName"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.businessName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your business name"
              disabled={isLoading}
            />
            {errors.businessName && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Business Slug */}
          <div>
            <label htmlFor="businessSlug" className="block text-sm font-medium text-gray-700 mb-2">
              Business Slug <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Used internally. Lowercase letters, numbers, hyphens.
            </p>
            <div className="relative">
              <input
                {...register('businessSlug')}
                type="text"
                id="businessSlug"
                onChange={handleSlugChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.businessSlug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="business-slug"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {slugChecking ? (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : slugAvailable === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : slugAvailable === false ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {errors.businessSlug ? (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessSlug.message}
                </p>
              ) : slugAvailable === true ? (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Slug is available
                </p>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleAutoGenerateSlug}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                Auto-generate from name
              </button>
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('contactEmail')}
              type="email"
              id="contactEmail"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.contactEmail ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {errors.contactEmail && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              {...register('contactPhone')}
              type="tel"
              id="contactPhone"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.contactPhone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={isLoading}
            />
            {errors.contactPhone && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Logo
          </label>
          <p className="text-xs text-gray-500 mb-4">
            PNG/JPG, up to 5MB
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Logo</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Upload your business logo</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Choose File
            </label>
          </div>
        </div>
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
          disabled={isLoading || !isDirty || Object.keys(errors).length > 0}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default BusinessProfileForm;
