import api, { deduplicatedRequest } from '../lib/api';
import { Table, CreateTableData, UpdateTableData, BulkCreateTableData, QRCodeResponse, DualQRCodeResponse } from '../types/table';

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

class TableService {
  // Get all tables for a branch
  async getTables(branchId: string): Promise<ApiResponse<{ tables: Table[]; pagination: unknown }>> {
    try {
      return await deduplicatedRequest(
        `tables-${branchId}`,
        async () => {
          const response = await api.get(`/business/settings/branches/${branchId}/tables`);
          return response.data;
        }
      );
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create new table
  async createTable(branchId: string, data: CreateTableData): Promise<ApiResponse<Table>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Bulk create tables
  async bulkCreateTables(branchId: string, data: BulkCreateTableData): Promise<ApiResponse<Table[]>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables/bulk`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get table sections
  async getTableSections(branchId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.get(`/business/settings/branches/${branchId}/tables/sections`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get specific table
  async getTable(branchId: string, tableId: string): Promise<ApiResponse<Table>> {
    try {
      const response = await api.get(`/business/settings/branches/${branchId}/tables/${tableId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update table
  async updateTable(branchId: string, tableId: string, data: UpdateTableData): Promise<ApiResponse<Table>> {
    try {
      const response = await api.put(`/business/settings/branches/${branchId}/tables/${tableId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete table
  async deleteTable(branchId: string, tableId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/business/settings/branches/${branchId}/tables/${tableId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Generate QR code for table
  async generateQrCode(branchId: string, tableId: string): Promise<ApiResponse<QRCodeResponse>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables/${tableId}/qr-code`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Generate dual QR codes for table (both WhatsApp and table ordering)
  async generateDualQrCodes(branchId: string, tableId: string): Promise<ApiResponse<DualQRCodeResponse>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables/${tableId}/dual-qr-codes`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Bulk generate QR codes for multiple tables
  async bulkGenerateQrCodes(branchId: string, tableIds: string[], type: 'whatsapp' | 'table_ordering' | 'both' = 'both'): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables/bulk-generate-qr-codes`, {
        table_ids: tableIds,
        type: type
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Regenerate QR code for table (if already exists)
  async regenerateQrCode(branchId: string, tableId: string): Promise<ApiResponse<QRCodeResponse>> {
    try {
      const response = await api.post(`/business/settings/branches/${branchId}/tables/${tableId}/qr-code`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Download QR code image
  async downloadQrCode(imageUrl: string, tableName: string): Promise<void> {
    try {
      console.log('Attempting to download QR code from:', imageUrl);
      
      // Check if URL is valid
      if (!imageUrl || imageUrl.includes('temp_')) {
        throw new Error('Invalid QR code URL - please regenerate QR codes first');
      }

      const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded image is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${tableName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('QR code downloaded successfully:', tableName);
    } catch (error) {
      console.error('Download error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to download QR code: ${error.message}`);
      }
      throw new Error('Failed to download QR code');
    }
  }

  // Download multiple QR codes as ZIP
  async downloadMultipleQrCodes(tables: Table[], type: 'whatsapp' | 'table_ordering' | 'both' = 'both'): Promise<void> {
    try {
      console.log('Downloading multiple QR codes:', tables);
      // In a real implementation, this would make an API call to generate a ZIP file
      // For now, we'll download each QR code individually using the backend proxy
      for (const table of tables) {
        console.log('Downloading QR code for table:', table.table_name);
        if (type === 'both' || type === 'whatsapp') {
          if (table.whatsapp_qr_code_image_url) {
            await this.downloadQrCode(
              table.whatsapp_qr_code_image_url, 
              `${table.table_name}-whatsapp`
            );
          }
        }
        if (type === 'both' || type === 'table_ordering') {
          if (table.qr_code_image_url) {
            await this.downloadQrCode(
              table.qr_code_image_url, 
              `${table.table_name}-table-ordering`
            );
          }
        }
      }
    } catch {
      throw new Error('Failed to download QR codes');
    }
  }

  // Copy QR code URL to clipboard
  async copyQrCodeUrl(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  // Get tables with fallback data
  async getTablesWithFallback(branchId: string): Promise<Table[]> {
    try {
      const response = await this.getTables(branchId);
      if (response.success && response.data && response.data.tables) {
        return response.data.tables;
      }
      throw new Error(response.message || 'Failed to get tables');
    } catch (error: unknown) {
      // Return fallback data if API fails
      console.warn('Using fallback tables data:', error);
      return [];
    }
  }

  // Validate table data
  validateTableData(data: CreateTableData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.table_name || data.table_name.length < 1) {
      errors.push('Table name is required');
    } else if (data.table_name.length > 50) {
      errors.push('Table name cannot exceed 50 characters');
    }

    if (data.section && data.section.length > 100) {
      errors.push('Section name cannot exceed 100 characters');
    }

    // Validate table name format
    if (data.table_name && !/^[a-zA-Z0-9\-\s]+$/.test(data.table_name)) {
      errors.push('Table name can only contain letters, numbers, hyphens, and spaces');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate bulk table data
  validateBulkTableData(data: BulkCreateTableData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.tables || data.tables.length === 0) {
      errors.push('At least one table is required');
    } else if (data.tables.length > 100) {
      errors.push('Cannot create more than 100 tables at once');
    }

    data.tables?.forEach((table, index) => {
      const tableValidation = this.validateTableData(table);
      if (!tableValidation.isValid) {
        tableValidation.errors.forEach(error => {
          errors.push(`Table ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate unique table names
  generateTableNames(count: number, prefix: string = 'Table'): string[] {
    const names: string[] = [];
    for (let i = 1; i <= count; i++) {
      names.push(`${prefix} ${i}`);
    }
    return names;
  }

  // Get dining code for a table
  async getDiningCode(tableId: string): Promise<ApiResponse<{ code: string; status: string; phone_number?: string; assistant_id?: string }>> {
    try {
      const response = await api.get(`/business/sessions/code/${tableId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create a restaurant session for a table (this will generate a dining code)
  async createRestaurantSession(businessId: string, branchId: string, tableId: string): Promise<ApiResponse<{ session: unknown; code: string }>> {
    try {
      const response = await api.post('/business/sessions', {
        business_id: businessId,
        branch_id: branchId,
        table_id: tableId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
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
      return new Error('Branch or table not found.');
    }
    
    if (error.response?.status === 422) {
      // Check for specific validation errors first
      if (error.response.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return new Error(errorMessages.join(', '));
      }
      // Fall back to main message if no specific errors
      if (error.response.data?.message) {
        return new Error(error.response.data.message);
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

export const tableService = new TableService();
export default tableService;
