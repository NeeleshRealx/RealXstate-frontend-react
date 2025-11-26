export interface BusinessProfile {
  id?: string;
  businessName: string;
  businessSlug: string;
  contactEmail: string;
  contactPhone?: string;
  logo?: string;
  logoFile?: File;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessProfileFormData {
  businessName: string;
  businessSlug: string;
  contactEmail: string;
  contactPhone: string;
  logo?: File;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}