export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  experienceYears?: string; 
  barCouncilId?: string; 
  role?:string
}

export interface ValidationErrors {
  businessName?: string;
  businessEmail?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export interface PasswordRequirement {
  met: boolean;
  text: string;
}

export interface LoginFormData {
  businessEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  token?: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export interface ResendEmailResponse {
  success: boolean;
  message: string;
  canResendAt?: string;
}

export interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'pending';
  message: string;
  email?: string;
  canResend: boolean;
  resendCooldown: number;
}
