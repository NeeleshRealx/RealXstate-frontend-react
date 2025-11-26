import { OpeningHours } from './settings';

export interface Branch {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone: string;
  manager?: {
    id: number;
    name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  contact_phone?: string;
  email?: string;
  timezone: string;
  manager_id?: string | null;
  is_active?: boolean;
  opening_hours?: OpeningHours;
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  is_active?: boolean;
}

export interface BranchFormData {
  name: string;
  address: string;
  timezone: string;
  contactPhone: string;
  managerId: string;
  isActive: boolean;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
}

export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

export interface BranchFilters {
  search: string;
  sortBy: 'name' | 'created' | 'timezone';
  sortOrder: 'asc' | 'desc';
  timezoneFilter: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}