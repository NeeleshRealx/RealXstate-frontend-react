import api from '../lib/api';
import { authenticationService } from './authenticationService';
import { User } from '../utils/authUtils';

export interface UserProfile {
  id: string;
  business_id: string;
  cognito_sub: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_image_url?: string;
  location?: string;
  timezone?: string;
  role: 'owner' | 'manager' | 'staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileData {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  location?: string;
  timezone?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  login_at: string;
  logout_at?: string;
  location?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

class UserService {
  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get('/business/settings/user/profile');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(data: UpdateUserProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.put('/business/settings/user/profile', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Upload profile image to S3
  async uploadProfileImage(file: File): Promise<ApiResponse<{ image_url: string }>> {
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const response = await api.post('/business/settings/user/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Change password using Amplify
  async changePassword(data: PasswordChangeData): Promise<ApiResponse> {
    try {
      const response = await authenticationService.updatePassword(
        data.current_password,
        data.new_password
      );
      
      return {
        success: response.success,
        message: response.message
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Get login history
  async getLoginHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    data: LoginHistoryEntry[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>> {
    try {
      const response = await api.get(`/business/settings/user/login-history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Enable/disable two-factor authentication
  async toggleTwoFactor(enabled: boolean): Promise<ApiResponse<{ qr_code?: string; secret?: string }>> {
    try {
      const response = await api.post('/business/settings/user/two-factor', { enabled });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Verify two-factor authentication setup
  async verifyTwoFactor(code: string): Promise<ApiResponse> {
    try {
      const response = await api.post('/business/settings/user/two-factor/verify', { code });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Get two-factor authentication status
  async getTwoFactorStatus(): Promise<ApiResponse<{ enabled: boolean; backup_codes?: string[] }>> {
    try {
      const response = await api.get('/business/settings/user/two-factor/status');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Validate phone number (using same validation as business settings)
  validatePhoneNumber(phone: string): { isValid: boolean; error: string; formatted: string } {
    if (!phone.trim()) {
      return { isValid: true, error: '', formatted: '' };
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Australian phone number validation
    let isValid = false;
    let formatted = phone;
    
    if (digitsOnly.length === 10) {
      // 10-digit Australian number
      if (digitsOnly.startsWith('04')) {
        // Mobile: 04XX XXX XXX
        formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
        isValid = true;
      } else if (digitsOnly.startsWith('02') || digitsOnly.startsWith('03') || 
                 digitsOnly.startsWith('07') || digitsOnly.startsWith('08')) {
        // Landline: 0X XXXX XXXX
        formatted = `${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 6)} ${digitsOnly.slice(6)}`;
        isValid = true;
      }
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('61')) {
      // 11-digit with country code
      const withoutCountryCode = digitsOnly.slice(2);
      if (withoutCountryCode.startsWith('4')) {
        // Mobile: +61 4XX XXX XXX
        formatted = `+61 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3, 6)} ${withoutCountryCode.slice(6)}`;
        isValid = true;
      } else if (withoutCountryCode.startsWith('2') || withoutCountryCode.startsWith('3') || 
                 withoutCountryCode.startsWith('7') || withoutCountryCode.startsWith('8')) {
        // Landline: +61 X XXXX XXXX
        formatted = `+61 ${withoutCountryCode.slice(0, 1)} ${withoutCountryCode.slice(1, 5)} ${withoutCountryCode.slice(5)}`;
        isValid = true;
      }
    } else if (digitsOnly.length === 9 && (digitsOnly.startsWith('4') || 
               digitsOnly.startsWith('2') || digitsOnly.startsWith('3') || 
               digitsOnly.startsWith('7') || digitsOnly.startsWith('8'))) {
      // 9-digit without leading 0
      if (digitsOnly.startsWith('4')) {
        // Mobile: 4XX XXX XXX
        formatted = `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
        isValid = true;
      } else {
        // Landline: X XXXX XXXX
        formatted = `${digitsOnly.slice(0, 1)} ${withoutCountryCode.slice(1, 5)} ${withoutCountryCode.slice(5)}`;
        isValid = true;
      }
    }
    
    if (!isValid) {
      return { 
        isValid: false, 
        error: 'Please enter a valid Australian phone number (e.g., 04XX XXX XXX or +61 4XX XXX XXX)', 
        formatted: phone 
      };
    }
    
    return { isValid: true, error: '', formatted };
  }

  // Error handler
  private handleError(error: any): Error {
    if (error.response?.status === 401) {
      return new Error('Authentication required. Please log in again.');
    }
    
    if (error.response?.status === 403) {
      return new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 422) {
      if (error.response.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => {
            const fieldName = this.getFieldDisplayName(field);
            if (Array.isArray(messages)) {
              return `${fieldName}: ${messages.join(', ')}`;
            }
            return `${fieldName}: ${messages}`;
          })
          .join('; ');
        return new Error(errorMessages);
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

  // Helper method to convert field names to user-friendly display names
  private getFieldDisplayName(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'full_name': 'Full Name',
      'phone': 'Phone Number',
      'profile_image_url': 'Profile Image',
      'location': 'Location',
      'timezone': 'Timezone',
      'current_password': 'Current Password',
      'new_password': 'New Password',
      'new_password_confirmation': 'Confirm New Password'
    };
    
    return fieldMap[field] || field.replace(/_/g, ' ').replace(/\*/g, '');
  }
}

export { UserService };
export const userService = new UserService();
export default userService;