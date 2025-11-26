import api, { deduplicatedRequest } from '../lib/api';
import { Branch, CreateBranchData, UpdateBranchData } from '../types/branch';
import { Branch as SettingsBranch } from '../types/settings';

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

class BranchService {
  // Get all branches
  async getBranches(): Promise<ApiResponse<{ branches: Branch[]; pagination: any }>> {
    try {
      return await deduplicatedRequest(
        'branches',
        async () => {
          const response = await api.get('/business/settings/branches');
          return response.data;
        }
      );
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get available timezones
  async getTimezones(): Promise<ApiResponse<Array<{ value: string; label: string }>>> {
    try {
      const response = await api.get('/business/settings/branches/timezones');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create new branch
  async createBranch(data: CreateBranchData): Promise<ApiResponse<Branch>> {
    try {
      const response = await api.post('/business/settings/branches', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get specific branch
  async getBranch(branchId: string): Promise<ApiResponse<Branch>> {
    try {
      const response = await api.get(`/business/settings/branches/${branchId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update branch
  async updateBranch(branchId: string, data: UpdateBranchData): Promise<ApiResponse<Branch>> {
    try {
      const response = await api.put(`/business/settings/branches/${branchId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Save branch (create or update)
  async saveBranch(branch: SettingsBranch, isUpdate: boolean = false, branchId?: string): Promise<ApiResponse<Branch>> {
    try {
      if (isUpdate && branchId) {
        // Update existing branch
        const updateData: UpdateBranchData = {
          name: branch.name,
          address: branch.address,
          timezone: branch.timezone,
          contact_phone: branch.phone,
          manager_id: null, // Since frontend sends manager names, not IDs
          is_active: branch.status === 'active',
          opening_hours: branch.opening_hours
        };
        return await this.updateBranch(branchId, updateData);
      } else {
        // Create new branch
        const createData: CreateBranchData = {
          name: branch.name,
          address: branch.address,
          timezone: branch.timezone,
          contact_phone: branch.phone,
          manager_id: null, // Since frontend sends manager names, not IDs
          is_active: branch.status === 'active',
          opening_hours: branch.opening_hours
        };
        return await this.createBranch(createData);
      }
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete branch
  async deleteBranch(branchId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/business/settings/branches/${branchId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get branches with fallback data
  async getBranchesWithFallback(): Promise<Branch[]> {
    try {
      const response = await this.getBranches();
      if (response.success && response.data && response.data.branches) {
        return response.data.branches;
      }
      throw new Error(response.message || 'Failed to get branches');
    } catch (error) {
      // Return fallback data if API fails
      console.warn('Using fallback branches data:', error);
      return [];
    }
  }

  // Validate branch data
  validateBranchData(data: CreateBranchData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Branch name must be at least 2 characters long');
    }

    if (!data.address || data.address.length < 10) {
      errors.push('Address must be at least 10 characters long');
    }

    if (!data.timezone) {
      errors.push('Timezone is required');
    }

    if (data.contact_phone && !this.isValidPhone(data.contact_phone)) {
      errors.push('Please enter a valid phone number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  private isValidPhone(phone: string): boolean {
    // Clean the phone number first
    const cleaned = this.cleanPhoneNumber(phone);
    // Validate Australian format: +61 + 9 digits
    const phoneRegex = /^\+61\d{9}$/;
    return phoneRegex.test(cleaned);
  }

  /**
   * Clean and format phone number for Australian format.
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except + (for country code)
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle Australian phone numbers
    if (cleaned.startsWith('61')) {
      // Convert 61 to +61
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      // Convert 0 to +61 for Australian numbers
      cleaned = '+61' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
      // If no country code, assume Australian and add +61
      cleaned = '+61' + cleaned;
    }
    
    return cleaned;
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
      return new Error('Branch not found.');
    }
    
    if (error.response?.status === 422) {
      if (error.response.data?.errors) {
        // Extract validation errors and format them nicely
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
      'name': 'Branch Name',
      'address': 'Address',
      'timezone': 'Timezone',
      'contact_phone': 'Phone Number',
      'manager_id': 'Manager',
      'opening_hours': 'Opening Hours',
      'opening_hours.*.is_open': 'Day Status',
      'opening_hours.*.time_slots': 'Time Slots',
      'opening_hours.*.time_slots.*.open': 'Opening Time',
      'opening_hours.*.time_slots.*.close': 'Closing Time',
      'opening_hours.*.time_slots.*.label': 'Time Slot Label'
    };
    
    return fieldMap[field] || field.replace(/_/g, ' ').replace(/\*/g, '');
  }
}

export const branchService = new BranchService();
export default branchService;