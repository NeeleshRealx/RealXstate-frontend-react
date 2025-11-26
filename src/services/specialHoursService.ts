import api from '../lib/api';

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

export interface SpecialHours {
  id?: string;
  date: string;
  is_open: boolean;
  time_slots: Array<{
    open: string;
    close: string;
    label?: string;
  }>;
  note: string;
}

export interface SpecialHoursResponse {
  special_hours: SpecialHours[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SpecialHoursService {
  private handleError(error: ApiError): never {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errors = error.response?.data?.errors;
    
    const errorMessage = errors 
      ? Object.entries(errors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join('; ')
      : message;
    
    throw new Error(errorMessage);
  }

  // Get special hours for a branch
  async getSpecialHours(branchId: string, startDate?: string, endDate?: string): Promise<ApiResponse<SpecialHoursResponse>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get(`/business/settings/branches/${branchId}/special-hours?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create special hours
  async createSpecialHours(branchId: string, data: SpecialHours): Promise<ApiResponse<SpecialHours>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/special-hours`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update special hours
  async updateSpecialHours(branchId: string, specialHoursId: string, data: SpecialHours): Promise<ApiResponse<SpecialHours>> {
    try {
      const response = await api.put(`/business/settings/branches/${branchId}/special-hours/${specialHoursId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete special hours
  async deleteSpecialHours(branchId: string, specialHoursId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/business/settings/branches/${branchId}/special-hours/${specialHoursId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Bulk create special hours
  async bulkCreateSpecialHours(branchId: string, data: {
    dates: string[];
    is_open: boolean;
    time_slots: Array<{
      open: string;
      close: string;
      label?: string;
    }>;
    note: string;
  }): Promise<ApiResponse<SpecialHours[]>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/special-hours/bulk`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }
}

export const specialHoursService = new SpecialHoursService();
