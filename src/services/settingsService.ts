import { businessProfileService } from './businessProfileService';
import { branchService } from './branchService';
import { openingHoursService } from './openingHoursService';
import { tableService } from './tableService';
import { BusinessProfile, UpdateBusinessProfileData } from '../types/settings';
import { Branch, CreateBranchData, UpdateBranchData } from '../types/branch';
import { OpeningHours, UpdateOpeningHoursData } from '../types/openingHours';
import { Table, CreateTableData, UpdateTableData, BulkCreateTableData } from '../types/table';

export interface SettingsData {
  businessProfile: BusinessProfile;
  branches: Branch[];
  openingHours: Record<string, OpeningHours>;
  tables: Record<string, Table[]>;
}

export interface SettingsError {
  type: 'businessProfile' | 'branches' | 'openingHours' | 'tables';
  message: string;
  error: Error;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class SettingsService {
  // Get all settings data for a business
  async getAllSettings(): Promise<SettingsData> {
    const errors: SettingsError[] = [];
    
    try {
      // Get business profile
      const businessProfile = await businessProfileService.getProfileWithFallback();
      
      // Get branches
      const branches = await branchService.getBranchesWithFallback();
      
      // Get opening hours for each branch
      const openingHours: Record<string, OpeningHours> = {};
      for (const branch of branches) {
        try {
          openingHours[branch.id] = await openingHoursService.getOpeningHoursWithFallback(branch.id);
        } catch (error) {
          errors.push({
            type: 'openingHours',
            message: `Failed to load opening hours for branch ${branch.name}`,
            error: error as Error
          });
        }
      }
      
      // Get tables for each branch
      const tables: Record<string, Table[]> = {};
      for (const branch of branches) {
        try {
          tables[branch.id] = await tableService.getTablesWithFallback(branch.id);
        } catch (error) {
          errors.push({
            type: 'tables',
            message: `Failed to load tables for branch ${branch.name}`,
            error: error as Error
          });
        }
      }
      
      // Log any errors that occurred
      if (errors.length > 0) {
        console.warn('Some settings failed to load:', errors);
      }
      
      return {
        businessProfile,
        branches,
        openingHours,
        tables
      };
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw new Error('Failed to load business settings');
    }
  }

  // Update business profile
  async updateBusinessProfile(data: UpdateBusinessProfileData): Promise<BusinessProfile> {
    try {
      // Validate data first
      const validation = businessProfileService.validateProfileData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await businessProfileService.updateProfile(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update business profile');
    } catch (error) {
      console.error('Failed to update business profile:', error);
      throw error;
    }
  }

  // Create new branch
  async createBranch(data: CreateBranchData): Promise<Branch> {
    try {
      // Validate data first
      const validation = branchService.validateBranchData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await branchService.createBranch(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create branch');
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  // Update branch
  async updateBranch(branchId: string, data: UpdateBranchData): Promise<Branch> {
    try {
      const response = await branchService.updateBranch(branchId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update branch');
    } catch (error) {
      console.error('Failed to update branch:', error);
      throw error;
    }
  }

  // Delete branch
  async deleteBranch(branchId: string): Promise<void> {
    try {
      const response = await branchService.deleteBranch(branchId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete branch');
      }
    } catch (error) {
      console.error('Failed to delete branch:', error);
      throw error;
    }
  }

  // Update opening hours
  async updateOpeningHours(branchId: string, data: UpdateOpeningHoursData): Promise<OpeningHours> {
    try {
      // Validate data first
      const validation = openingHoursService.validateOpeningHours(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await openingHoursService.updateOpeningHours(branchId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update opening hours');
    } catch (error) {
      console.error('Failed to update opening hours:', error);
      throw error;
    }
  }

  // Create table
  async createTable(branchId: string, data: CreateTableData): Promise<Table> {
    try {
      // Validate data first
      const validation = tableService.validateTableData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await tableService.createTable(branchId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create table');
    } catch (error) {
      console.error('Failed to create table:', error);
      throw error;
    }
  }

  // Bulk create tables
  async bulkCreateTables(branchId: string, data: BulkCreateTableData): Promise<Table[]> {
    try {
      // Validate data first
      const validation = tableService.validateBulkTableData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await tableService.bulkCreateTables(branchId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create tables');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // Update table
  async updateTable(branchId: string, tableId: string, data: UpdateTableData): Promise<Table> {
    try {
      const response = await tableService.updateTable(branchId, tableId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update table');
    } catch (error) {
      console.error('Failed to update table:', error);
      throw error;
    }
  }

  // Delete table
  async deleteTable(branchId: string, tableId: string): Promise<void> {
    try {
      const response = await tableService.deleteTable(branchId, tableId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Failed to delete table:', error);
      throw error;
    }
  }

  // Generate QR code for table
  async generateTableQrCode(branchId: string, tableId: string): Promise<string> {
    try {
      const response = await tableService.generateQrCode(branchId, tableId);
      if (response.success && response.data) {
        return response.data.qr_code_url;
      }
      throw new Error(response.message || 'Failed to generate QR code');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  // Get available timezones
  async getTimezones(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await branchService.getTimezones();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get timezones');
    } catch (error) {
      console.error('Failed to get timezones:', error);
      // Return fallback timezones
      return [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'UTC', label: 'UTC' }
      ];
    }
  }

  // Validate all settings data
  validateAllSettings(settings: SettingsData): SettingsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate business profile
    if (!settings.businessProfile.name || settings.businessProfile.name.length < 2) {
      errors.push('Business name is required and must be at least 2 characters');
    }

    if (!settings.businessProfile.contact_email) {
      errors.push('Business contact email is required');
    }

    // Validate branches
    if (settings.branches.length === 0) {
      warnings.push('No branches configured. Consider adding at least one branch.');
    }

    settings.branches.forEach(branch => {
      if (!branch.name || branch.name.length < 2) {
        errors.push(`Branch "${branch.name || 'Unnamed'}" must have a valid name`);
      }
      if (!branch.address || branch.address.length < 10) {
        warnings.push(`Branch "${branch.name}" should have a complete address`);
      }
    });

    // Validate opening hours
    Object.entries(settings.openingHours).forEach(([branchId, hours]) => {
      const branch = settings.branches.find(b => b.id === branchId);
      const branchName = branch?.name || 'Unknown Branch';
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      days.forEach(day => {
        const dayHours = hours[day];
        if (dayHours.is_open && (!dayHours.time_slots || dayHours.time_slots.length === 0)) {
          warnings.push(`${branchName} - ${day.charAt(0).toUpperCase() + day.slice(1)}: Open but no time slots configured`);
        }
      });
    });

    // Validate tables
    Object.entries(settings.tables).forEach(([branchId, tables]) => {
      const branch = settings.branches.find(b => b.id === branchId);
      const branchName = branch?.name || 'Unknown Branch';
      
      if (tables.length === 0) {
        warnings.push(`${branchName}: No tables configured`);
      }
      
      tables.forEach(table => {
        if (!table.table_name) {
          errors.push(`${branchName}: Table must have a name`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Export settings data
  exportSettings(settings: SettingsData): string {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        businessProfile: settings.businessProfile,
        branches: settings.branches,
        openingHours: settings.openingHours,
        tables: settings.tables
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw new Error('Failed to export settings data');
    }
  }

  // Import settings data
  importSettings(data: string): SettingsData {
    try {
      const importedData = JSON.parse(data);
      
      // Validate imported data structure
      if (!importedData.businessProfile || !importedData.branches) {
        throw new Error('Invalid settings data format');
      }
      
      return {
        businessProfile: importedData.businessProfile,
        branches: importedData.branches || [],
        openingHours: importedData.openingHours || {},
        tables: importedData.tables || {}
      };
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Failed to import settings data');
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
