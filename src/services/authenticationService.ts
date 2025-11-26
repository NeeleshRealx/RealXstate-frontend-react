import api from '../lib/api';
import { 
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  updatePassword as amplifyUpdatePassword,
  signOut as amplifySignOut,
  fetchAuthSession
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { 
  storeAuthData,
  storeTokenData ,
  clearAuthData, 
  clearAuthAndRedirect,
  getStoredAuthData, 
  extractUserFromToken,
  validateCognitoToken,
  User as AuthUtilsUser
} from '@/utils/authUtils';
import { jwtDecode } from 'jwt-decode';

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  businessName: string;
  email: string;
  password: string;
  password_confirmation: string;
  contactPhone?: string;
  acceptTos: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  business_id?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  success: boolean;
  businessId: number;
  businessName: string;
  businessSlug: string;
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    fullName: string;
    isFirstTime: boolean;
  };
  redirectUrl: string;
  message: string;
}

/**
 * Decode and inspect JWT token payload
 */
const inspectJwtToken = (token: string): any => {
  try {
    const decoded = jwtDecode(token);
    console.log('[AuthenticationService] JWT Token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('[AuthenticationService] Failed to decode JWT token:', error);
    return null;
  }
};

class AuthenticationService {
  /**
   * Login with email and password using Amplify + Backend
   */
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      console.log('[AuthenticationService] Starting login process for:', data.email);
      
      // Step 0: Check if user is already signed in and sign out if necessary
      try {
        const currentSession = await fetchAuthSession();
        if (currentSession.tokens) {
          console.log('[AuthenticationService] User already signed in, signing out first');
          await amplifySignOut();
        }
      } catch (error) {
        // No existing session, continue with login
        console.log('[AuthenticationService] No existing session found, proceeding with login');
      }
      
      // Step 1: Sign in with Amplify
      const amplifyResult = await amplifySignIn({
        username: data.email,
        password: data.password
      });
      
      if (!amplifyResult.isSignedIn) {
        throw new Error('Amplify authentication failed');
      }
      
      // Debug: Log the amplify result structure
      console.log('[AuthenticationService] Amplify result structure:', {
        isSignedIn: amplifyResult.isSignedIn,
        resultKeys: Object.keys(amplifyResult),
        hasNextStep: 'nextStep' in amplifyResult,
        hasChallengeName: 'challengeName' in amplifyResult
      });
      
      // Step 2: Get JWT tokens from Amplify session
      const session = await fetchAuthSession();
      // Force refresh to ensure we get fresh JWT tokens
      // const session = await fetchAuthSession({ forceRefresh: true });
      console.log('[AuthenticationService] Amplify session:', session);
      
      if (!session.tokens) {
        throw new Error('No tokens available from Amplify session');
      }
      
      // Debug: Log the structure of the session tokens
      console.log('[AuthenticationService] Session tokens structure:', {
        hasIdToken: !!session.tokens.idToken,
        hasAccessToken: !!session.tokens.accessToken,
        idTokenType: typeof session.tokens.idToken,
        accessTokenType: typeof session.tokens.accessToken,
        sessionKeys: Object.keys(session),
        tokensKeys: Object.keys(session.tokens)
      });
      
      // Debug: Log the actual token values (first 50 chars for security)
      if (session.tokens.idToken) {
        const idTokenStr = session.tokens.idToken.toString() || "";
        console.log('[AuthenticationService] ID Token details:', {
          length: idTokenStr.length,
          preview: idTokenStr.substring(0, 50) + '...',
          segments: idTokenStr.split('.').length,
          isJWT: idTokenStr.split('.').length === 3
        });
      }
      
      if (session.tokens.accessToken) {
        const accessTokenStr = session.tokens.accessToken.toString() || "";
        console.log('[AuthenticationService] Access Token details:', {
          length: accessTokenStr.length,
          preview: accessTokenStr.substring(0, 50) + '...',
          segments: accessTokenStr.split('.').length,
          isJWT: accessTokenStr.split('.').length === 3
        });
      }
      
      // Debug: Check if there are other token properties
      console.log('[AuthenticationService] Full session object keys:', {
        sessionKeys: Object.keys(session),
        tokensKeys: Object.keys(session.tokens),
        hasRefreshToken: !!(session.tokens as any).refreshToken,
        hasOtherTokens: Object.keys(session.tokens).filter(key => !['idToken', 'accessToken', 'refreshToken'].includes(key))
      });
      
      // Use idToken instead of accessToken as it contains user information
      let jwtToken: string;
      let accessToken = session?.tokens?.accessToken?.toString() || '';
      let idToken = session?.tokens?.idToken?.toString() || '';
      console.log({
        access_token: accessToken, // Send Amplify access token
        id_token: idToken,     // Send Amplify ID token
      },"Sending to backend")
      // if (session.tokens.idToken) {
      //   // Try different ways to extract the token string
      //   const idToken = session.tokens.idToken;
      //   if (typeof idToken === 'string') {
      //     jwtToken = idToken;
      //   } else if (idToken && typeof idToken === 'object' && 'toString' in idToken) {
      //     jwtToken = idToken.toString();
      //   } else if (idToken && typeof idToken === 'object' && 'payload' in idToken) {
      //     // If it's a Cognito token object, try to get the raw token
      //     jwtToken = (idToken as any).toString();
      //   } else {
      //     console.error('[AuthenticationService] Unable to extract ID token string', {
      //       tokenType: typeof idToken,
      //       tokenKeys: idToken ? Object.keys(idToken) : 'null'
      //     });
      //     throw new Error('Unable to extract ID token string from Amplify session');
      //   }
      //   console.log('[AuthenticationService] Using ID token from Amplify', {
      //     tokenType: typeof session.tokens.idToken,
      //     tokenLength: jwtToken.length
      //   });
      // } else if (session.tokens.accessToken) {
      //   // Try different ways to extract the token string
      //   const accessToken = session.tokens.accessToken;
      //   if (typeof accessToken === 'string') {
      //     jwtToken = accessToken;
      //   } else if (accessToken && typeof accessToken === 'object' && 'toString' in accessToken) {
      //     jwtToken = accessToken.toString();
      //   } else if (accessToken && typeof accessToken === 'object' && 'payload' in accessToken) {
      //     // If it's a Cognito token object, try to get the raw token
      //     jwtToken = (accessToken as any).toString();
      //   } else {
      //     console.error('[AuthenticationService] Unable to extract access token string', {
      //       tokenType: typeof accessToken,
      //       tokenKeys: accessToken ? Object.keys(accessToken) : 'null'
      //     });
      //     throw new Error('Unable to extract access token string from Amplify session');
      //   }
      //   console.log('[AuthenticationService] Using access token from Amplify (fallback)', {
      //     tokenType: typeof session.tokens.accessToken,
      //     tokenLength: jwtToken.length
      //   });
      // } else {
      //   throw new Error('No ID token or access token available from Amplify');
      // }
      
      // // Validate JWT token format
      // const tokenParts = jwtToken.split('.');
      // console.log('[AuthenticationService] JWT Token analysis:', {
      //   tokenLength: jwtToken.length,
      //   tokenPreview: jwtToken.substring(0, 50) + '...',
      //   segmentCount: tokenParts.length,
      //   segments: tokenParts.map((part, index) => ({ index, length: part.length }))
      // });
      
      // if (tokenParts.length !== 3) {
      //   console.error('[AuthenticationService] Invalid JWT token format received from Amplify:', {
      //     expectedSegments: 3,
      //     actualSegments: tokenParts.length,
      //     tokenLength: jwtToken.length,
      //     tokenPreview: jwtToken.substring(0, 50) + '...',
      //     tokenType: typeof jwtToken
      //   });
        
      //   // Provide clear error message based on token format
      //   if (tokenParts.length === 1 && jwtToken.length === 64) {
      //     throw new Error('Received opaque token instead of JWT from Amplify. This usually means: 1) Cognito User Pool is configured to return opaque tokens instead of JWT tokens, 2) Amplify is not properly configured to return JWT tokens, or 3) There is a mismatch in the authentication flow. Please check your Cognito User Pool configuration and ensure it returns JWT tokens.');
      //   } else if (tokenParts.length === 1) {
      //     throw new Error('Invalid token format: Expected JWT token with 3 segments (header.payload.signature), but received single segment token. This suggests Amplify is not returning a proper JWT token from Cognito.');
      //   } else {
      //     throw new Error(`Invalid JWT token format: Expected 3 segments (header.payload.signature), but received ${tokenParts.length} segments. This indicates the token is malformed or not a valid JWT from Cognito.`);
      //   }
      // }
      
      // Inspect JWT token payload to see what user information is available
      // try {
      //   const decoded = jwtDecode(jwtToken);
      //   console.log('[AuthenticationService] JWT Token payload:', decoded);
      // } catch (error) {
      //   console.error('[AuthenticationService] Failed to decode JWT token:', error);
      // }

  console.log({
    access_token: accessToken, // Send Amplify access token
    id_token: idToken,     // Send Amplify ID token
  },"Sending to backend")
      
      // Step 3: Call backend login API with JWT token and Amplify tokens
      const response = await api.post('/public/business/login', {
        access_token: accessToken, // Send Amplify access token
        id_token: idToken,     // Send Amplify ID token
      }, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      
      const backendResponse = response.data;
      console.log('[AuthenticationService] Backend login response:', backendResponse);

      if (backendResponse.success) {
        const userData: AuthUtilsUser = {
          id: backendResponse.user.id.toString(),
          sub: backendResponse.user.id.toString(),
          name: backendResponse.user.fullName,
          email: backendResponse.user.email,
          business_id: backendResponse.businessId.toString()
        };
  
        const refreshToken = (session?.tokens as { refreshToken?: { toString(): string } })?.refreshToken?.toString() || '';
        
        // Step 5: Store authentication data with proper expiration
        const expiresAt = Math.floor(Date.now() / 1000) + (5 * 60); // 5 minutes for session tokens
        let tokenDetails = {
          sucess:true,
          accessToken: accessToken,
          idToken: idToken,
          refreshToken: refreshToken,
          expiresAt: expiresAt
        };
        storeTokenData(tokenDetails, userData);
        console.log('[AuthenticationService] Login successful',);
        return backendResponse;
      }
      
      else {
        throw new Error(backendResponse.message || 'Backend login failed');
      }
      
      // Step 4: Extract and store user data
     
      
    } catch (error) {
      console.error('[AuthenticationService] Login error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Signup with business data using Amplify + Backend
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Starting signup process for:', data.email);
      
      // Step 1: Sign up with Amplify
      const amplifyResult = await amplifySignUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.businessName
          },
          autoSignIn: false
        }
      });
      
      console.log('[AuthenticationService] Amplify signup result:', amplifyResult);
      
      // Step 2: Call backend signup API (this will be called after email verification)
      // For now, just return success - the actual backend signup happens after email verification
      
      return {
        success: true,
        message: 'Signup initiated. Please check your email for verification code.',
        data: {
          user: {
            id: amplifyResult.userId || '',
            name: data.businessName,
            email: data.email,
            role: 'owner',
            business_id: undefined
          },
          access_token: '',
          token_type: 'Bearer',
          expires_in: 0
        }
      };
      
    } catch (error) {
      console.error('[AuthenticationService] Signup error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Complete signup after email verification
   */
  async completeSignup(jwtToken: string, signupData: SignupData): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Completing signup with JWT token');
      
      // Call backend signup API with JWT token
      const response = await api.post('/public/business/signup', signupData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      const signupResponse = response.data;
      
      if (signupResponse.success && signupResponse.data) {
        // Store authentication data
        const userData: AuthUtilsUser = {
          id: signupResponse.data.user.id,
          sub: signupResponse.data.user.id,
          name: signupResponse.data.user.name,
          email: signupResponse.data.user.email,
          business_id: signupResponse.data.user.business_id
        };
        
        storeAuthData(signupResponse.data.access_token, userData);
        console.log('[AuthenticationService] Signup completed successfully');
      }
      
      return {
        success: signupResponse.success,
        message: signupResponse.message || 'Signup completed successfully',
        data: signupResponse.data
      };
      
    } catch (error) {
      console.error('[AuthenticationService] Complete signup error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Verify email with OTP code and complete signup
   */
  async verifyEmail(email: string, code: string, signupData?: SignupData): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Verifying email for:', email);
      
      // Step 1: Confirm signup with Amplify
      await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code
      });
      console.log('[AuthenticationService] Email verified with Amplify');
      
      // Step 2: Sign in the user to get JWT tokens
      console.log('[AuthenticationService] Signing in user to get JWT tokens');
      
      // We need to sign in the user after email verification to get tokens
      // For this, we need the password from signupData
      if (!signupData || !signupData.password) {
        throw new Error('Password required to complete signup process');
      }
      
      const signInResult = await amplifySignIn({
        username: email,
        password: signupData.password
      });
      
      if (!signInResult.isSignedIn) {
        throw new Error('Failed to sign in after email verification');
      }
      
      console.log('[AuthenticationService] User signed in successfully');
      
      // Step 3: Get JWT tokens from Amplify session
      const session = await fetchAuthSession();
      console.log('[AuthenticationService] Amplify session:', session);
      
      if (!session.tokens) {
        throw new Error('No tokens available from Amplify session');
      }
      
      // Use idToken instead of accessToken as it contains user information
      let jwtToken: string;
      let accessToken = session?.tokens?.accessToken?.toString() || '';
      let idToken = session?.tokens?.idToken?.toString() || '';
      if (session.tokens.idToken) {
        jwtToken = session.tokens.idToken.toString();
        console.log('[AuthenticationService] Using ID token from Amplify', jwtToken);
      } else if (session.tokens.accessToken) {
        jwtToken = session.tokens.accessToken.toString();
        console.log('[AuthenticationService] Using access token from Amplify (fallback)', jwtToken);
      } else {
        throw new Error('No ID token or access token available from Amplify');
      }
      
      // Step 4: Call backend signup with JWT token
      console.log('[AuthenticationService] Calling backend signup with JWT token');
      const response = await api.post('/public/business/signup', signupData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      const signupResponse = response.data;
      
      console.log('[AuthenticationService] Backend signup response:', signupResponse);
      
      // Check if the response is successful
      if (signupResponse.success) {
        // Signup was successful, proceed with auto-login
        
        // Step 5: Automatically log in the user after successful signup
        console.log('[AuthenticationService] Automatically logging in user after successful signup');
        
        try {
          // Call the login API with the same JWT token to complete the login process
          const loginResponse = await api.post('/public/business/login', {
            access_token: accessToken, // Send Amplify access token
            id_token: idToken,     // Send Amplify ID token
          }, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            }
          });
          
          console.log('[AuthenticationService] Auto-login response:', loginResponse.data);
          
          if (loginResponse.data.success) {
            // Extract user data from login response
            const loginData = loginResponse.data;
            const finalUserData: AuthUtilsUser = {
              id: loginData.user.id.toString(),
              sub: loginData.user.id.toString(),
              name: loginData.user.fullName || loginData.user.name,
              email: loginData.user.email,
              business_id: loginData.businessId.toString()
            };
            
            // Store authentication data
            const refreshToken = (session?.tokens as { refreshToken?: { toString(): string } })?.refreshToken?.toString() || '';
        
        // Step 5: Store authentication data with proper expiration
          const expiresAt = Math.floor(Date.now() / 1000) + (5 * 60); // 5 minutes for session tokens
          storeAuthData(accessToken, finalUserData, refreshToken, expiresAt);
            
            console.log('[AuthenticationService] User automatically logged in after signup');
            
            return {
              success: true,
              message: 'Account created and logged in successfully!',
              data: {
                ...signupResponse.data,
                loginData: loginData
              }
            };
          } else {
            console.warn('[AuthenticationService] Auto-login failed, but signup was successful');
            // Signup was successful, but auto-login failed - user can manually log in
            await amplifySignOut();
            return {
              success: true,
              message: 'Account created successfully! Please log in to continue.',
              data: signupResponse.data
            };
          }
        } catch (loginError) {
          console.error('[AuthenticationService] Auto-login failed after signup:', loginError);
          // Signup was successful, but auto-login failed - user can manually log in
          await amplifySignOut();
          return {
            success: true,
            message: 'Account created successfully! Please log in to continue.',
            data: signupResponse.data
          };
        }
      } else {
        // Log the error response for debugging
        console.error('[AuthenticationService] Backend signup failed:', signupResponse);
        throw new Error(signupResponse.message || signupResponse.error || 'Backend signup failed');
      }
      
    } catch (error) {
      console.error('[AuthenticationService] Email verification error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Resend verification code
   */
  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Resending verification code for:', email);
      
      await amplifyResendSignUpCode({
        username: email
      });
      
      return {
        success: true,
        message: 'Verification code sent successfully.'
      };
      
    } catch (error) {
      console.error('[AuthenticationService] Resend verification error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Forgot password request
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[AuthenticationService] Requesting password reset for:', email);
      
      // First, check if user exists and has logged in before
      try {
        const userCheckResponse = await api.post('/public/business/check-user-exists', {
          email: email
        });
        
        if (!userCheckResponse.data.success) {
          console.log('[AuthenticationService] User check failed:', userCheckResponse.data.message);
          console.log('[AuthenticationService] Returning error response:', {
            success: false,
            message: userCheckResponse.data.message
          });
          return {
            success: false,
            message: userCheckResponse.data.message
          };
        }
      } catch (userCheckError: any) {
        console.error('[AuthenticationService] User check error:', userCheckError);
        
        // Handle specific backend errors
        if (userCheckError.response?.data?.message) {
          return {
            success: false,
            message: userCheckError.response.data.message
          };
        } else if (userCheckError.response?.status === 404) {
          return {
            success: false,
            message: 'No account found with this email address. Please sign up first.'
          };
        } else if (userCheckError.response?.status === 403) {
          return {
            success: false,
            message: 'You must log in at least once before you can reset your password. Please contact support if you need assistance.'
          };
        }
        
        // Generic error
        return {
          success: false,
          message: 'Failed to verify user account. Please try again.'
        };
      }
      
      // If user check passes, proceed with Amplify password reset
      await amplifyResetPassword({
        username: email
      });
      
      return {
        success: true,
        message: 'Password reset code sent to your email.'
      };
      
    } catch (error: any) {
      console.error('[AuthenticationService] Forgot password error:', error);
      
      let message = 'Failed to send password reset code';
      
      // Handle Amplify errors
      if (error.name === 'UserNotFoundException') {
        message = 'No account found with this email address';
      } else if (error.name === 'LimitExceededException') {
        message = 'Too many attempts. Please try again later';
      } else if (error.message) {
        message = error.message;
      }
      
      return {
        success: false,
        message
      };
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Confirming password reset for:', email);
      
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });
      
      return {
        success: true,
        message: 'Password reset successfully. You can now sign in with your new password.'
      };
      
    } catch (error) {
      console.error('[AuthenticationService] Confirm password reset error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Submit new password with OTP verification (alias for confirmPasswordReset)
   */
  async forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[AuthenticationService] Submitting new password for:', email);
      
      await amplifyConfirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });
      
      return {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.'
      };
      
    } catch (error: any) {
      console.error('[AuthenticationService] Forgot password submit error:', error);
      
      let message = 'Failed to reset password';
      if (error.name === 'CodeMismatchException') {
        message = 'Invalid verification code. Please check your email and try again';
      } else if (error.name === 'ExpiredCodeException') {
        message = 'Verification code has expired. Please request a new one';
      } else if (error.name === 'InvalidPasswordException') {
        message = 'Password does not meet requirements. Please use a stronger password';
      } else if (error.message) {
        message = error.message;
      }
      
      return {
        success: false,
        message
      };
    }
  }

  /**
   * Update user password using Amplify
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[AuthenticationService] Updating password');
      
      // amplifyUpdatePassword doesn't return a value on success, only throws on error
      await amplifyUpdatePassword({
        oldPassword,
        newPassword
      });
 
      console.log('[AuthenticationService] Password updated successfully');
      
      // If we reach here, the password was updated successfully
      return {
        success: true,
        message: 'Password updated successfully'
      };
      
    } catch (error: any) {
      console.error('[AuthenticationService] Update password error:', error);
      
      let message = 'Failed to update password';
      
      // Handle specific Amplify error types
      if (error.name === 'ChangePasswordException') {
        message = 'Failed to change password. Please check your current password and try again.';
      } else if (error.name === 'AuthValidationErrorCode') {
        message = 'Password validation failed. Please ensure both passwords are provided.';
      } else if (error.name === 'AuthTokenConfigException') {
        message = 'Authentication configuration error. Please try again later.';
      } else if (error.name === 'NotAuthorizedException') {
        message = 'Current password is incorrect';
      } else if (error.name === 'InvalidPasswordException') {
        message = 'New password does not meet requirements';
      } else if (error.name === 'LimitExceededException') {
        message = 'Too many attempts. Please try again later';
      } else if (error.message) {
        message = error.message;
      }
      
      return {
        success: false,
        message
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('[AuthenticationService] Getting current user profile');
      
      const response = await api.get('/business/profile');
      
      const profileResponse = response.data;
      if (profileResponse.success && profileResponse.data) {
        const userData: User = {
          id: response.data.user.id.toString(),
          name: response.data.user.fullName || response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role || 'owner',
          business_id: response.data.business?.id?.toString()
        };
        
        // Update stored user data
        const { token } = getStoredAuthData();
        if (token) {
          const authUtilsUser: AuthUtilsUser = {
            ...userData,
            sub: userData.id
          };
          storeAuthData(token, authUtilsUser);
        }
        
        return userData;
      }
      
      return null;
      
    } catch (error) {
      console.error('[AuthenticationService] Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user (Amplify + Backend)
   */
  async logout(): Promise<void> {
    try {
      console.log('[AuthenticationService] Starting logout process');
      
      // Step 1: Call backend logout endpoint
      try {
        await api.post('/user/logout');
        console.log('[AuthenticationService] Backend logout successful');
      } catch (error) {
        console.warn('[AuthenticationService] Backend logout failed:', error);
      }
      
      // Step 2: Sign out from Amplify
      try {
        await amplifySignOut();
        Hub.dispatch('auth', { event: 'signedOut' });
        console.log('[AuthenticationService] Amplify signout successful');
      } catch (error) {
        console.warn('[AuthenticationService] Amplify signout failed:', error);
      }
      
      // Step 3: Clear local auth data
      clearAuthData();
      console.log('[AuthenticationService] Local auth data cleared');
      
      console.log('[AuthenticationService] Logout completed successfully');
      
    } catch (error) {
      console.error('[AuthenticationService] Logout error:', error);
      // Still clear local data even if logout fails
      clearAuthData();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      console.log('[AuthenticationService] Refreshing token');
      
      // Get current Amplify session tokens
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No tokens available for refresh');
      }
      
      const accessToken = session.tokens.accessToken?.toString() || '';
      const idToken = session.tokens.idToken?.toString() || '';
      
      const response = await api.post('/business/refresh', {
        access_token: accessToken,
        id_token: idToken,
      });
      
      const refreshResponse = response.data;
      if (refreshResponse.success) {
        // Update stored token with the refreshed Amplify token
        const { user } = getStoredAuthData();
        if (user) {
          storeAuthData(refreshResponse.accessToken, user);
        }
        
        console.log('[AuthenticationService] Token refreshed successfully');
      }
      
      return {
        success: refreshResponse.success,
        message: refreshResponse.message || 'Token refreshed successfully',
        data: refreshResponse
      };
      
    } catch (error) {
      console.error('[AuthenticationService] Refresh token error:', error);
      throw await this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const { token, user } = getStoredAuthData();
    return !!(token && user && validateCognitoToken(token));
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const { user } = getStoredAuthData();
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email || '',
        role: 'owner', // Default role since authUtils User doesn't have role
        business_id: user.business_id
      };
    }
    return null;
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    const { token } = getStoredAuthData();
    return token;
  }

  /**
   * Validate stored authentication
   */
  async validateStoredAuth(): Promise<boolean> {
    try {
      const { token, user } = getStoredAuthData();
      
      if (!token || !user) {
        return false;
      }
      
      // Validate token
      if (!validateCognitoToken(token)) {
        clearAuthData();
        return false;
      }
      
      // Check with backend
      const response = await api.get('/business/profile');
      const profileResponse = response.data;
      return profileResponse.success;
      
    } catch (error) {
      console.error('[AuthenticationService] Validate stored auth error:', error);
      clearAuthData();
      return false;
    }
  }

  /**
   * Get current Amplify session
   */
  async getCurrentSession() {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('[AuthenticationService] Get current session error:', error);
      return null;
    }
  }



  /**
   * Error handler
   */
  private async handleError(error: any): Promise<Error> {
    console.error('[AuthenticationService] Error details:', error);
    
    // Handle NotAuthorizedException from AWS Cognito
    if (error.name === 'NotAuthorizedException' || error.__type === 'NotAuthorizedException') {
      const errorMessage = error.message || '';
      
      // Check if user has been deleted
      if (errorMessage.includes('user has been deleted') || 
          errorMessage.includes('refresh token') ||
          errorMessage.includes('User does not exist')) {
        
        console.log('[AuthenticationService] User deleted or invalid refresh token detected, clearing auth data');
        
        // Sign out from Amplify first
        try {
          await amplifySignOut();
          console.log('[AuthenticationService] Successfully signed out from Amplify due to deleted user');
        } catch (signOutError) {
          console.error('[AuthenticationService] Error signing out from Amplify:', signOutError);
        }
        
        // Clear all auth data and redirect
        clearAuthAndRedirect();
        
        return new Error('Your account has been deleted or is no longer valid. Please contact support or create a new account.');
      }
      
      return new Error('Authentication failed. Please log in again.');
    }
    
    if (error.response?.status === 401) {
      return new Error('Invalid credentials. Please check your email and password.');
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
      const errorMessage = error.response.data?.error || error.response.data?.message || '';
      const isExpiredToken = errorMessage.toLowerCase().includes('expired token') || 
                            errorMessage.toLowerCase().includes('token validation failed') ||
                            errorMessage.toLowerCase().includes('opaque token') ||
                            errorMessage.toLowerCase().includes('received opaque token');
      
      if (isExpiredToken) {
        console.log('[AuthenticationService] Expired token detected in 500 error, signing out from Amplify');
        
        // Clear all auth cookies
        clearAuthData();
        
        // Sign out from Amplify
        try {
          await amplifySignOut();
          console.log('[AuthenticationService] Successfully signed out from Amplify due to expired token');
        } catch (signOutError) {
          console.error('[AuthenticationService] Error signing out from Amplify:', signOutError);
        }
        
        return new Error('Your session has expired. Please log in again.');
      }
      
      return new Error('Server error. Please try again later.');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

// Export singleton instance
export const authenticationService = new AuthenticationService();
export default authenticationService;
