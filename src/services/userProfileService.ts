import api from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  fullName: string;
  isActive: boolean;
  phone?: string;
  location?: string;
  timezone?: string;
  joinDate?: string;
  profilePicture?: string;
  business?: {
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export interface ApiUserProfileResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    phone?: string;
    location?: string;
    timezone?: string;
    isActive: boolean;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
    contactEmail: string;
    contactPhone: string;
  };
}

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  location?: string;
  timezone?: string;
}

class UserProfileService {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<ApiUserProfileResponse>('/user/me');
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        
        // Convert API response to UserProfile format
        const profile: UserProfile = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          isActive: userData.isActive,
          // Use API values or set default values for optional fields
          phone: userData.phone || '',
          location: userData.location || '',
          timezone: userData.timezone || 'America/New_York', // Default timezone
          joinDate: new Date().toISOString().split('T')[0], // Default to today
          // Include business information
          business: response.data.business || undefined,
        };
        
        return profile;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: unknown) {
      console.error('[UserProfileService] Failed to get profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const response = await api.put<ApiUserProfileResponse>('/user/profile', data);
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        
        // Convert API response to UserProfile format
        const profile: UserProfile = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          isActive: userData.isActive,
          phone: userData.phone || '',
          location: userData.location || '',
          timezone: userData.timezone || 'America/New_York',
          joinDate: new Date().toISOString().split('T')[0], // Default to today
          // Include business information
          business: response.data.business || undefined,
          ...data, // Include updated fields
        };
        
        return profile;
      }
      
      throw new Error('Failed to update user profile');
    } catch (error: unknown) {
      console.error('[UserProfileService] Failed to update profile:', error);
      throw error;
    }
  }

  // Upload profile picture - TODO: Implement when backend supports it
  async uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
    // TODO: Implement profile picture upload when backend endpoint is available
    throw new Error('Profile picture upload not yet implemented');
  }
}

export const userProfileService = new UserProfileService();
