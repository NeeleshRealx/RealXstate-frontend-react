import { SettingsCard } from '../types/settings';
import { businessProfileService, type BusinessProfile, type UpdateBusinessProfileData, type ApiResponse } from './index';

export class BusinessService {
  static async getBusinessProfile() {
    try {
      const response = await businessProfileService.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get business profile');
    } catch (error) {
      console.error('Error getting business profile:', error);
      throw error;
    }
  }

  static async updateBusinessProfile(data: UpdateBusinessProfileData): Promise<ApiResponse<BusinessProfile>> {
    try {
      return await businessProfileService.updateProfile(data);
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }

  static async uploadLogo(file: File): Promise<{ logo_url: string }> {
    try {
      const response = await businessProfileService.uploadLogo(file);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload logo');
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  }

  static async deleteLogo(): Promise<void> {
    try {
      const response = await businessProfileService.deleteLogo();
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete logo');
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  }

  static async getSettingsData(): Promise<SettingsCard[]> {
    // This could fetch dynamic settings based on user permissions
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 'business-profile',
            title: 'Business Profile',
            description: 'Edit business name, contact info, and logo.',
            icon: 'Building2',
            iconColor: 'text-blue-600',
            iconBg: 'bg-blue-100',
            path: '/settings/business-profile'
          },
          // Add other cards as needed
        ]);
      }, 500);
    });
  }
}