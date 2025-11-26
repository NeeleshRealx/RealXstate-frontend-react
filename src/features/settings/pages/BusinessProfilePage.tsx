import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import SettingsHeader from '@/components/layout/SettingsHeader';
import BusinessProfileForm from '@/features/settings/components/BusinessProfile';
import { LoadingPlaceholder, ErrorPlaceholder } from '@/components/ui';
import { BusinessProfile as BusinessProfileType } from '@/types/settings';
import { businessProfileService } from '@/services/businessProfileService';

const BusinessProfilePage: React.FC = () => {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Settings', href: '/settings' },
    { label: 'Business Profile' }
  ];

  // Load business profile on component mount
  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await businessProfileService.getProfile();
        if (response.success && response.data) {
          setBusinessProfile(response.data);
        }
      } catch (err) {
        setError('Failed to load business profile');
        toast.error('Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessProfile();
  }, []);

  const handleSubmit = async (data: BusinessProfileType) => {
    try {
      const response = await businessProfileService.updateProfile(data);
      if (response.success && response.data) {
        setBusinessProfile(response.data);
        toast.success('Business profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update business profile');
      }
    } catch (err) {
      toast.error('Failed to update business profile');
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <LoadingPlaceholder
        icon={Building2}
        title="Loading Business Profile"
        subtitle="Please wait while we fetch your business information"
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading Business Profile"
        subtitle={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <SettingsHeader
        title="Business Profile"
        subtitle="Manage your business information and branding"
        breadcrumbs={breadcrumbs}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <BusinessProfileForm
              profile={businessProfile}
              onSave={handleSubmit}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessProfilePage;
