import api from '../lib/api';
import { BusinessProfile, UpdateBusinessProfileData } from '../types/settings';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

class BusinessProfileService {
  // Get business profile
  async getProfile(): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await api.get('/business/settings/business-profile');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update business profile
  async updateProfile(data: UpdateBusinessProfileData): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await api.put('/business/settings/business-profile', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Upload logo
  async uploadLogo(file: File): Promise<ApiResponse<{ logo_url: string }>> {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/business/settings/business-profile/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete logo
  async deleteLogo(): Promise<ApiResponse> {
    try {
      const response = await api.delete('/business/settings/business-profile/logo');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get settings hub
  async getSettingsHub(): Promise<ApiResponse> {
    try {
      const response = await api.get('/business/settings/hub');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get permissions
  async getPermissions(): Promise<ApiResponse> {
    try {
      const response = await api.get('/business/settings/permissions');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get business profile with fallback data
  async getProfileWithFallback(): Promise<BusinessProfile> {
    try {
      const response = await this.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get business profile');
    } catch (error) {
      // Return fallback data if API fails
      console.warn('Using fallback business profile data:', error);
      return {
        id: 'fallback',
        name: 'Your Business',
        slug: 'your-business',
        contact_email: 'contact@yourbusiness.com',
        contact_phone: '',
        logo_url: '',
        description: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        business_hours: {},
        social_links: {},
        // created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString(),
      };
    }
  }

  // Validate business profile data
  validateProfileData(data: UpdateBusinessProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name && data.name.length < 2) {
      errors.push('Business name must be at least 2 characters long');
    }

    if (data.contact_email && !this.isValidEmail(data.contact_email)) {
      errors.push('Please enter a valid email address');
    }

    if (data.contact_phone && !this.isValidPhone(data.contact_phone)) {
      errors.push('Please enter a valid phone number');
    }

    if (data.slug && !this.isValidSlug(data.slug)) {
      errors.push('URL slug can only contain lowercase letters, numbers, and hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Australian phone number validation
    // Mobile: 04XX XXX XXX (10 digits starting with 04)
    // Landline: 0X XXXX XXXX (10 digits starting with 02, 03, 07, 08)
    // With country code: +61 4XX XXX XXX or +61 X XXXX XXXX
    
    if (cleaned.length === 10) {
      // 10-digit Australian number
      return cleaned.startsWith('04') || cleaned.startsWith('02') || 
             cleaned.startsWith('03') || cleaned.startsWith('07') || cleaned.startsWith('08');
    } else if (cleaned.length === 11 && cleaned.startsWith('61')) {
      // 11-digit with country code
      const withoutCountryCode = cleaned.slice(2);
      return withoutCountryCode.startsWith('4') || withoutCountryCode.startsWith('2') || 
             withoutCountryCode.startsWith('3') || withoutCountryCode.startsWith('7') || 
             withoutCountryCode.startsWith('8');
    } else if (cleaned.length === 9 && (cleaned.startsWith('4') || cleaned.startsWith('2') || 
               cleaned.startsWith('3') || cleaned.startsWith('7') || cleaned.startsWith('8'))) {
      // 9-digit without leading 0
      return true;
    }
    
    return false;
  }

  private isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug);
  }

  // Error handler with enhanced error information
  private handleError(error: ApiError): Error {
    if (error.response?.status === 401) {
      return new Error('Authentication required. Please log in again.');
    }
    
    if (error.response?.status === 403) {
      return new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 404) {
      return new Error('Business profile not found.');
    }
    
    if (error.response?.status === 422) {
      if (error.response.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return new Error(errorMessages.join(', '));
      }
    }
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 500) {
      return new Error('Server error. Please try again later.');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const businessProfileService = new BusinessProfileService();
export default businessProfileService;
