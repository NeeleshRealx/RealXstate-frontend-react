import api from '../lib/api';
import { OpeningHours, UpdateOpeningHoursData } from '../types/openingHours';

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

class OpeningHoursService {
  // Get opening hours for a branch
  async getOpeningHours(branchId: string): Promise<ApiResponse<OpeningHours>> {
    try {
      const response = await api.get(`/business/settings/branches/${branchId}/opening-hours`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update opening hours for a branch
  async updateOpeningHours(branchId: string, data: UpdateOpeningHoursData): Promise<ApiResponse<OpeningHours>> {
    try {
      // Wrap the data in opening_hours field as expected by the backend
      const requestData = {
        opening_hours: data
      };
      
      const response = await api.put(`/business/settings/branches/${branchId}/opening-hours`, requestData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get opening hours with fallback data
  async getOpeningHoursWithFallback(branchId: string): Promise<OpeningHours> {
    try {
      const response = await this.getOpeningHours(branchId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get opening hours');
    } catch (error) {
      // Return fallback data if API fails
      console.warn('Using fallback opening hours data:', error);
      return this.getDefaultOpeningHours(branchId);
    }
  }

  // Get default opening hours structure
  private getDefaultOpeningHours(branchId: string): OpeningHours {
    const defaultDayHours = {
      is_open: false,
      time_slots: []
    };

    return {
      id: 'default',
      branch_id: branchId,
      monday: { ...defaultDayHours },
      tuesday: { ...defaultDayHours },
      wednesday: { ...defaultDayHours },
      thursday: { ...defaultDayHours },
      friday: { ...defaultDayHours },
      saturday: { ...defaultDayHours },
      sunday: { ...defaultDayHours },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Validate opening hours data
  validateOpeningHours(data: UpdateOpeningHoursData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    days.forEach(day => {
      const dayData = data[day];
      if (dayData) {
        if (dayData.is_open && (!dayData.time_slots || dayData.time_slots.length === 0)) {
          errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: Time slots are required when the day is open`);
        }

        if (dayData.time_slots) {
          dayData.time_slots.forEach((slot, index) => {
            if (!slot.open || !slot.close) {
              errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: Time slot ${index + 1} must have both open and close times`);
            } else if (slot.open >= slot.close) {
              errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: Time slot ${index + 1} close time must be after open time`);
            }
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert time format (HH:MM AM/PM to HH:MM)
  convertTimeFormat(time: string): string {
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(' ');
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return time;
  }

  // Convert time format back (HH:MM to HH:MM AM/PM)
  convertTimeFormatBack(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
      return new Error('Branch or opening hours not found.');
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

export const openingHoursService = new OpeningHoursService();
export default openingHoursService;