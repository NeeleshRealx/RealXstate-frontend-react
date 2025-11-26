import { jwtDecode } from 'jwt-decode';
import { fetchAuthSession } from 'aws-amplify/auth';
import { 
  getCookie, 
  deleteCookie, 
  setCookieWithExpiry,
  isCookieExpired
} from './cookieUtils';

// Extended interface to include refreshToken
interface ExtendedAuthTokens {
  accessToken?: { toString(): string };
  idToken?: { toString(): string; payload: { sub?: string } };
  refreshToken?: { toString(): string };
}

export interface JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  phone_number?: string;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  exp?: number;
  nbf?: number;
  iss?: string;
}

export interface User {
  id: string;
  sub: string;
  name: string;
  email: string | null;
  phone_number?: string | null;
  cognitoGroups?: string[];
  business_id?: string;
}

export interface TokenData {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Cookie names for serv-ai
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'SA_access_token',
  ACCESS_TOKEN_INITIAL: 'SA_access_token_initial',
  ID_TOKEN: 'SA_id_token',
  COGNITO_TOKEN: 'SA_cognito_token',
  REFRESH_TOKEN: 'SA_refresh_token',
  TOKEN_EXPIRES_AT: 'SA_token_expires_at',
  USER: 'SA_user',
  BUSINESS_ID: 'SA_business_id'
} as const;

/**
 * Validates a Cognito JWT token
 */
export const validateCognitoToken = (token: string): boolean => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token is expired');
      return false;
    }

    // Check if token is not yet valid
    if (payload.nbf && payload.nbf > currentTime) {
      console.log('Token is not yet valid');
      return false;
    }

    // Validate issuer (should match your Cognito User Pool)
    const expectedIssuer = `https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_4dAoy4nk3`;
    if (payload.iss !== expectedIssuer) {
      console.log('Invalid token issuer');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Checks if a token will expire within the next 5 minutes
 */
export const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferMinutes * 60; // Convert minutes to seconds
    
    if (payload.exp) {
      return (payload.exp - currentTime) <= bufferTime;
    }
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't decode
  }
};

/**
 * Extracts user information from a JWT token
 */
export const extractUserFromToken = (token: string, sub: string): User => {
  const payload = jwtDecode<JwtPayload>(token);
  console.log('payload', payload);
  
  return {
    id: sub,
    sub: sub,
    name: payload.name || payload['cognito:username'] || 'User',
    email: payload.email || null,
    phone_number: payload.phone_number || null,
    cognitoGroups: payload['cognito:groups'] || [],
  };
};

/**
 * Stores authentication data in cookies with proper expiration
 */
export const storeAuthData = (token: string, user: User, refreshToken?: string, expiresAt?: number) => {
  const expiresInSeconds = expiresAt ? expiresAt - Math.floor(Date.now() / 1000) : 5 * 60; // 5 minutes default
  
  // Store tokens with expiration
  setCookieWithExpiry(COOKIE_NAMES.ID_TOKEN, token, expiresInSeconds);
  setCookieWithExpiry(COOKIE_NAMES.ACCESS_TOKEN, token, expiresInSeconds);
  setCookieWithExpiry(COOKIE_NAMES.USER, JSON.stringify(user), expiresInSeconds);
  
  if (refreshToken) {
    // Refresh token can have longer expiration (15 days)
    setCookieWithExpiry(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 15 * 24 * 60 * 60);
  }
  
  if (expiresAt) {
    setCookieWithExpiry(COOKIE_NAMES.TOKEN_EXPIRES_AT, expiresAt.toString(), expiresInSeconds);
  }
  
  console.log('[CookieUtils] Stored auth data with expiration:', {
    expiresInSeconds,
    expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : 'default',
    cookiesSet: ['ID_TOKEN', 'ACCESS_TOKEN', 'USER']
  });
};

/**
 * Stores complete token data including refresh token in cookies
 * - Writes immutable ACCESS_TOKEN_INITIAL at first login only
 * - Never overwrites ACCESS_TOKEN on subsequent refreshes
 */
export const storeTokenData = (tokenData: TokenData, user: User) => {
  const expiresInSeconds = tokenData.expiresAt - Math.floor(Date.now() / 1000);

  // Set immutable initial access token if not already set
  const initialAccess = getCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL);
  if (!initialAccess) {
    setCookieWithExpiry(COOKIE_NAMES.ACCESS_TOKEN_INITIAL, tokenData.accessToken, 15 * 24 * 60 * 60);
    // For backward compatibility: also set ACCESS_TOKEN on first login
    setCookieWithExpiry(COOKIE_NAMES.ACCESS_TOKEN, tokenData.accessToken, expiresInSeconds);
  }
  
  // Store Cognito ID token and other session metadata (safe to update)
  setCookieWithExpiry(COOKIE_NAMES.ID_TOKEN, tokenData.idToken, 5 * 60); // 5 minutes
  setCookieWithExpiry(COOKIE_NAMES.COGNITO_TOKEN, tokenData.idToken, 5 * 60); // 5 minutes
  setCookieWithExpiry(COOKIE_NAMES.REFRESH_TOKEN, tokenData.refreshToken, 15 * 24 * 60 * 60); // 15 days
  setCookieWithExpiry(COOKIE_NAMES.TOKEN_EXPIRES_AT, tokenData.expiresAt.toString(), expiresInSeconds);
  setCookieWithExpiry(COOKIE_NAMES.USER, JSON.stringify(user), expiresInSeconds);
  
  console.log('[CookieUtils] Stored complete token data with expiration:', {
    expiresInSeconds,
    expiresAt: new Date(tokenData.expiresAt * 1000).toISOString()
  });
};

/**
 * Retrieves stored token data from cookies
 */
export const getStoredTokenData = (): TokenData | null => {
  const idToken = getCookie(COOKIE_NAMES.COGNITO_TOKEN);
  const accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);
  const expiresAtStr = getCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT);
  
  // Only require idToken, accessToken, and expiresAt - refreshToken is optional
  if (!idToken || !accessToken || !expiresAtStr) {
    console.log('[CookieUtils] Missing required token data:', {
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasExpiresAt: !!expiresAtStr
    });
    return null;
  }
  
  // Check if cookies are expired
  if (isCookieExpired(COOKIE_NAMES.ACCESS_TOKEN)) {
    console.log('[CookieUtils] Access token cookie is expired');
    return null;
  }
  
  return {
    accessToken,
    idToken,
    refreshToken: refreshToken || '', // Use empty string if refresh token is not available
    expiresAt: parseInt(expiresAtStr, 10)
  };

};

/**
 * Helper to get immutable API access token (initial login token)
 * This is the token that should be used for all backend API calls
 */
export const getInitialApiAccessToken = (): string | null => {
  return getCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL) || getCookie(COOKIE_NAMES.ACCESS_TOKEN) || null;
};

/**
 * Gets the token that should be used for API calls
 * Always prioritizes the immutable initial token
 */
export const getApiToken = (): string | null => {
  return getInitialApiAccessToken();
};

/**
 * Debug function to check token consistency
 * This helps identify when tokens become mismatched
 */

/**
 * Checks if current tokens need refresh
 */
export const needsTokenRefresh = (): boolean => {
  const tokenData = getStoredTokenData();
  if (!tokenData) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // 5 minutes buffer
  
  return (tokenData.expiresAt - currentTime) <= bufferTime;
};

/**
 * Refreshes tokens using Amplify's fetchAuthSession
 * - Does NOT overwrite ACCESS_TOKEN or ACCESS_TOKEN_INITIAL
 * - Only updates Cognito ID token and local expiry scheduling if needed
 */
export const refreshTokens = async (): Promise<TokenData | null> => {
  try {
    console.log('Refreshing tokens...');
    
    const session = await fetchAuthSession();

    console.log('session.tokens', session?.tokens);
    console.log('session.tokens.accessToken', session?.tokens?.accessToken);
    console.log('session.tokens.idToken', session?.tokens?.idToken);
    
    if (session.tokens && session.tokens.accessToken && session.tokens.idToken) {
      const accessToken = session.tokens.accessToken.toString();
      const idToken = session.tokens.idToken.toString();
      
      const extendedTokens = session.tokens as ExtendedAuthTokens;
      const refreshToken = extendedTokens.refreshToken?.toString() || getCookie(COOKIE_NAMES.REFRESH_TOKEN) || '';

      // Calculate a conservative expiration time (5 minutes for testing)
      const expiresAt = Math.floor(Date.now() / 1000) + (5 * 60);

      // IMPORTANT: Do NOT overwrite ACCESS_TOKEN or ACCESS_TOKEN_INITIAL here
      // Update only Cognito-related cookies for client scheduling/UX
      setCookieWithExpiry(COOKIE_NAMES.COGNITO_TOKEN, idToken, 5 * 60);
      setCookieWithExpiry(COOKIE_NAMES.TOKEN_EXPIRES_AT, expiresAt.toString(), 5 * 60);
      if (refreshToken) {
        setCookieWithExpiry(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 15 * 24 * 60 * 60);
      }

      console.log('Tokens refreshed (Cognito session maintained without changing API access token)');

      return { accessToken, idToken, refreshToken, expiresAt };
    }
    
    // If we don't have valid tokens, try to get them from stored data
    const storedTokenData = getStoredTokenData();
    if (storedTokenData && storedTokenData.accessToken && storedTokenData.idToken) {
      console.log('Using stored token data');
      return storedTokenData;
    }
    
    console.log('No valid tokens in session or stored data');
    return null;
  } catch (error: any) {
    console.error('Error refreshing tokens:', error);
    
    // Handle NotAuthorizedException from AWS Cognito
    if (error.name === 'NotAuthorizedException' || error.__type === 'NotAuthorizedException') {
      const errorMessage = error.message || '';
      
      // Check if user has been deleted or refresh token is invalid
      if (errorMessage.includes('user has been deleted') || 
          errorMessage.includes('refresh token') ||
          errorMessage.includes('User does not exist')) {
        
        console.log('[AuthUtils] User deleted or invalid refresh token detected, clearing auth data');
        
        // Clear all auth data and redirect
        clearAuthAndRedirect();
        
        return null;
      }
    }
    
    return null;
  }
};

/**
 * Gets a valid access token, refreshing if necessary (not used by API anymore)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    if (needsTokenRefresh()) {
      console.log('Tokens need refresh, attempting to refresh...');
      await refreshTokens();
    }
    // Always return the immutable initial API token
    return getInitialApiAccessToken();
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return getInitialApiAccessToken();
  }
};

/**
 * Clears authentication data from cookies
 */
export const clearAuthData = () => {
  deleteCookie(COOKIE_NAMES.ID_TOKEN);
  deleteCookie(COOKIE_NAMES.COGNITO_TOKEN);
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT);
  deleteCookie(COOKIE_NAMES.USER);
  deleteCookie(COOKIE_NAMES.BUSINESS_ID);
  
  console.log('[CookieUtils] Cleared all auth cookies');
};

/**
 * Clear auth data and redirect to login (for user deleted scenarios)
 */
export const clearAuthAndRedirect = (): void => {
  clearAuthData();
  
  // Clear any Amplify session data
  if (typeof window !== 'undefined') {
    // Clear localStorage and sessionStorage
    localStorage.removeItem('amplify-signin-with-hostedUI');
    localStorage.removeItem('amplify-redirect-signin');
    localStorage.removeItem('amplify-redirect-signout');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login';
  }
};

/**
 * Retrieves stored authentication data from cookies
 * IMPORTANT: For API calls, always use the immutable ACCESS_TOKEN_INITIAL
 */
export const getStoredAuthData = (): { token: string | null; user: User | null } => {
  // For API calls, always use the immutable initial token
  const initialToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL);
  const accessToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  const idToken = getCookie(COOKIE_NAMES.ID_TOKEN);
  const userStr = getCookie(COOKIE_NAMES.USER);
  
  const token = initialToken || accessToken;
  
  console.log('[CookieUtils] Reading stored auth data:', {
    hasInitialToken: !!initialToken,
    hasAccessToken: !!accessToken,
    hasIdToken: !!idToken,
    hasUser: !!userStr,
    finalToken: !!token
  });
  
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
  };
};

/**
 * Gets the current Amplify session
 */
export const getCurrentAmplifySession = async () => {
  try {
    return await fetchAuthSession();
  } catch (error) {
    console.error('Error fetching Amplify session:', error);
    return null;
  }
};

/**
 * Gets auth token from cookies
 */
export const getAuthToken = (): string | null => {
  return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
};

/**
 * Gets user data from cookies
 */
export const getUserData = (): User | null => {
  const userStr = getCookie(COOKIE_NAMES.USER);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clears auth token from cookies
 */
export const clearAuthToken = (): void => {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.USER);
  deleteCookie(COOKIE_NAMES.BUSINESS_ID);
};

