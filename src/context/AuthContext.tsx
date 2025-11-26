import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { authenticationService } from '../services/authenticationService';
import { 
  validateCognitoToken, 
  extractUserFromToken, 
  storeAuthData, 
  clearAuthData, 
  storeTokenData,
  getStoredAuthData,
  type User
} from '@/utils/authUtils';
import tokenService from '@/services/tokenService';
import api from '@/lib/api';
// User interface is now imported from authUtils

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  login: (user: User) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signUp: (username: string, password: string, attributes?: Record<string, string>) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  validateCognitoToken: (token: string) => Promise<boolean>;
  authenticateWithDeepLink: (token: string, sub: string) => Promise<void>;
  getCurrentSession: () => Promise<Awaited<ReturnType<typeof fetchAuthSession>> | null>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authStateChangeCount, setAuthStateChangeCount] = useState(0);
  
  // Add debounce mechanism to prevent multiple simultaneous token refreshes
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cross-tab communication keys (serv-ai specific)
  const AUTH_STORAGE_KEY = 'serv_ai_auth_state';
  const AUTH_EVENT_KEY = 'serv_ai_auth_event';

  // Log authentication state changes
  useEffect(() => {
    console.log('AuthContext: Authentication state changed', {
      isAuthenticated,
      user: user?.name || 'none',
      authStateChangeCount,
      isLoading
    });
  }, [isAuthenticated, user, authStateChangeCount, isLoading]);



  // Broadcast authentication state changes to other tabs
  useEffect(() => {
    const authData = {
      isAuthenticated,
      user,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('AuthContext: Error storing auth state:', error);
    }
  }, [isAuthenticated, user]);

  // Helper function to clear all auth-related data
  const clearAllAuthData = () => {
    console.log('AuthContext: Clearing all auth data');
    clearAuthData();
    // Also clear business_id since it's tied to authentication
    localStorage.removeItem('business_id');
    // Clear agent builder session data
    localStorage.removeItem('agentBuilderCurrentStep');
    localStorage.removeItem('agentBuilderData');
    localStorage.removeItem('currentAgentId');
    // Clear auth redirect flags
    
    // Clear token service auto-refresh
    tokenService.clearAutoRefresh();
    
    setUser(null);
    setIsAuthenticated(false);
    setAuthStateChangeCount(prev => prev + 1);
    
    // Broadcast logout to other tabs
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: false, user: null, timestamp: Date.now() }));
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: { type: 'logout' } }));
    } catch (error) {
      console.error('AuthContext: Error broadcasting logout:', error);
    }
  };

  // Validate Cognito JWT token
  const validateCognitoTokenAsync = async (token: string): Promise<boolean> => {
    return validateCognitoToken(token);
  };

  // Authenticate with deep link token
  const authenticateWithDeepLink = async (token: string, sub: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Validate the token
      const isValid = await validateCognitoTokenAsync(token);
      if (!isValid) {
        throw new Error('Invalid or expired token');
      }

      // Extract user information from token
      const userData = extractUserFromToken(token, sub);
      console.log("userData", userData);
      
      // Store token and user data
      storeAuthData(token, userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthStateChangeCount(prev => prev + 1);
      
      // Set up automatic token refresh
      tokenService.setupAutoRefresh();
      
      // Clear auth redirect flags since authentication was successful
      // Clear auth redirect flags
      
      // Broadcast login to other tabs
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: { type: 'login' } }));
      
      console.log('Successfully authenticated with deep link token');
    } catch (error) {
      console.error('Error authenticating with deep link:', error);
      clearAllAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current session from Amplify
  const getCurrentSession = async (): Promise<Awaited<ReturnType<typeof fetchAuthSession>> | null> => {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  };

  // Refresh token
  const refreshToken = async () => {
    // Prevent multiple simultaneous token refreshes
    if (isRefreshing) {
      console.log('AuthContext: Token refresh already in progress, skipping...');
      return;
    }

    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a small delay to debounce multiple rapid refresh attempts
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        setIsRefreshing(true);
        console.log('AuthContext: Attempting to refresh token...');
        const refreshedData = await tokenService.refreshTokens();
        
        if (refreshedData) {
          console.log('AuthContext: Token refreshed successfully');
          const userData = extractUserFromToken(refreshedData.idToken, refreshedData.idToken.split('.')[1] ? JSON.parse(atob(refreshedData.idToken.split('.')[1])).sub : '');
          
          setUser(userData);
          setIsAuthenticated(true);
          setAuthStateChangeCount(prev => prev + 1);
          
          // Set up automatic token refresh after a short delay
          setTimeout(() => {
            tokenService.setupAutoRefresh();
          }, 100);
          
          // Clear auth redirect flags since authentication was successful
          // Clear auth redirect flags
        } else {
          console.log('AuthContext: No valid tokens in session');
          throw new Error('No valid tokens in session');
        }
      } catch (error) {
        console.error('AuthContext: Error refreshing token:', error);
        clearAllAuthData();
      } finally {
        setIsRefreshing(false);
      }
    }, 100); // 100ms debounce delay
  };

  // Initialize authentication on app load
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Initializing authentication...');
      
      // Check for deep link token in URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const sub = urlParams.get('sub');
      
      if (token && sub) {
        console.log('AuthContext: Found deep link parameters, authenticating...');
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        await authenticateWithDeepLink(token, sub);
        return;
      }

      // Check for stored user data
      const { token: storedToken, user: storedUser } = getStoredAuthData();
      console.log("storedUser", storedUser);
      console.log("storedToken", storedToken);

      if (storedUser && storedToken) {
        console.log('AuthContext: Found stored auth data, validating token...');
        // Validate stored token
        const isValid = await validateCognitoTokenAsync(storedToken);
        if (isValid) {
          console.log('AuthContext: Stored token is valid, authenticating user');
          setUser(storedUser);
          setIsAuthenticated(true);
          setAuthStateChangeCount(prev => prev + 1);
          
          // Set up automatic token refresh
          tokenService.setupAutoRefresh();
          
          // Clear auth redirect flags
        } else {
          console.log('AuthContext: Stored token is invalid, trying Amplify session...');
          // Token is invalid, try to get fresh session from Amplify
          const session = await getCurrentSession();
          if (session && session.tokens && session.tokens.idToken) {
            console.log('AuthContext: Found valid Amplify session, refreshing...');
            await refreshToken();
          } else {
            console.log('AuthContext: No valid Amplify session, clearing auth data');
            clearAllAuthData();
          }
        }
      } else {
        console.log('AuthContext: No stored auth data, checking Amplify session...');
        // Try to get current session from Amplify
        const session = await getCurrentSession();
        if (session && session.tokens && session.tokens.idToken) {
          console.log('AuthContext: Found valid Amplify session, refreshing...');
          await refreshToken();
        } else {
          console.log('AuthContext: No valid sessions found, user not authenticated');
          clearAllAuthData();
        }
      }
    } catch (error) {
      console.error('AuthContext: Error initializing auth:', error);
      // Clear any invalid data
      clearAllAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize authentication on mount
  useEffect(() => {
    // Listen for auth events
    const listener = (data: { payload: { event: string } }) => {
      console.log('AuthContext: Received auth event:', data.payload.event);
      switch (data.payload.event) {
        case 'signIn':
          refreshToken();
          break;
        case 'signOut':
          logout();
          break;
        case 'tokenRefresh':
          refreshToken();
          break;
      }
    };

    Hub.listen('auth', listener);
    initializeAuth();

    return () => {
      // Clear any pending refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      // Note: Hub.remove is not available in Amplify v6, but the listener will be cleaned up automatically
    };
  }, []);

  const login = (userData: User) => {
    console.log('AuthContext: User logged in:', userData.name);
    setUser(userData);
    setIsAuthenticated(true);
    setAuthStateChangeCount(prev => prev + 1);
    
    // User data is now stored in cookies via tokenService, no need to store separately
    
    // Initialize token service with stored data first
    tokenService.initialize();
    
    // Set up automatic token refresh after a short delay to ensure tokens are stored
    setTimeout(() => {
      tokenService.setupAutoRefresh();
    }, 100);
    
    // Clear auth redirect flags since authentication was successful
    // Clear auth redirect flags
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login with email:', email);
      
      const response = await authenticationService.login({ email, password });
      
      if (response.success) {
        const userData: User = {
          id: response.user.id.toString(),
          sub: response.user.id.toString(),
          name: response.user.fullName,
          email: response.user.email,
          business_id: response.businessId.toString()
        };
        console.log(response,"response")
        
        // Store token data first
        // const tokenData = {
        //   accessToken: response.accessToken,
        //   idToken: response.accessToken,
        //   refreshToken: response.accessToken,
        //   expiresAt: Math.floor(Date.now() / 1000) + (5 * 60)
        // };
        
        
        // Store complete token data using the new system
        // storeTokenData(tokenData, userData);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: userData, businessId: userData.business_id } 
        }));

        // Broadcast login to other tabs
        window.dispatchEvent(new CustomEvent(AUTH_EVENT_KEY, { detail: { type: 'login' } }));
        
        login(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext: User logging out');
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('AuthContext: Error during logout API call:', e);
    }
    
    clearAllAuthData();
    
    // Sign out from Cognito
    try {
      await signOut();
    } catch (e) {
      console.error('AuthContext: Error signing out from Cognito:', e);
    }
  };
  const signUp = async (username: string, password: string, attributes?: Record<string, string>) => {
    try {
      console.log('[AuthContext] Signing up user:', username);
      
      const response = await authenticationService.signup({
        businessName: attributes?.businessName || 'New Business',
        email: username,
        password,
        password_confirmation: password,
        acceptTos: true
      });
      
      return response;
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      throw error;
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      console.log('[AuthContext] Confirming signup for:', username);
      
      const response = await authenticationService.verifyEmail(username, code);
      
      return response;
    } catch (error) {
      console.error('[AuthContext] Confirm signup error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    login,
    signUp,
    confirmSignUp,
    loginWithEmail,
    logout,
    validateCognitoToken: validateCognitoTokenAsync,
    authenticateWithDeepLink,
    getCurrentSession,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  console.log(ctx,"context")
  if (!ctx) {
    // During development, React refresh can sometimes cause this error
    // Provide a fallback to prevent the app from crashing
    console.warn('useAuth must be used within an AuthProvider - this might be a React refresh issue');
    
    // Return a default context to prevent crashes
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: () => {},
      setIsAuthenticated: () => {},
      login: () => {},
      signUp: async () => {},
      confirmSignUp: async () => {},
      loginWithEmail: async () => {},
      logout: async () => {},
      validateCognitoToken: async () => false,
      authenticateWithDeepLink: async () => {},
      getCurrentSession: async () => null,
      refreshToken: async () => {}
    };
  }
  return ctx;
};