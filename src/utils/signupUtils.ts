import api from '@/lib/api';
import { toast } from 'sonner';

export interface PendingSignupData {
  businessName: string;
  email: string;
  password: string;
  password_confirmation: string;
  contactPhone: string;
  acceptTos: boolean;
  timestamp: number;
}

export const getPendingSignupData = (): PendingSignupData | null => {
  try {
    const data = localStorage.getItem('pendingSignupData');
    if (!data) return null;
    
    const signupData = JSON.parse(data) as PendingSignupData;
    
    // Check if data is not too old (24 hours)
    const isExpired = Date.now() - signupData.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem('pendingSignupData');
      return null;
    }
    
    return signupData;
  } catch (error) {
    console.error('Error parsing pending signup data:', error);
    localStorage.removeItem('pendingSignupData');
    return null;
  }
};

export const clearPendingSignupData = (): void => {
  localStorage.removeItem('pendingSignupData');
};

export const completeBackendSignup = async (jwtToken: string): Promise<boolean> => {
  try {
    const signupData = getPendingSignupData();
    if (!signupData) {
      console.error('No pending signup data found');
      return false;
    }

    console.log('Completing backend signup with JWT token...');
    
    const response = await api.post('/public/business/signup', {
      businessName: signupData.businessName,
      email: signupData.email,
      password: signupData.password,
      password_confirmation: signupData.password_confirmation,
      contactPhone: signupData.contactPhone,
      acceptTos: signupData.acceptTos
    }, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    const result = response.data;
    
    if (result.success) {
      console.log('Backend signup completed successfully');
      clearPendingSignupData();
      toast.success('Backend account setup completed!');
      return true;
    } else {
      console.error('Backend signup failed:', result.message);
      toast.error(result.message || 'Backend setup failed. Please contact support.');
      return false;
    }
  } catch (error: any) {
    console.error('Error completing backend signup:', error);
    
    if (error.response?.status === 409) {
      toast.error('Account already exists in our system');
    } else if (error.response?.status === 422) {
      toast.error('Validation error. Please contact support.');
    } else {
      toast.error('Backend setup failed. Please contact support.');
    }
    
    return false;
  }
};
