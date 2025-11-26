import axios from 'axios';
import tokenService from '@/services/tokenService';
import { getCookie, deleteCookie } from '@/utils/cookieUtils';
import { getInitialApiAccessToken, COOKIE_NAMES } from '@/utils/authUtils';
import { config } from '@/config';

// Create axios instance
const api = axios.create({
  baseURL: config.api.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Track if we're in the middle of a redirect
let isRedirecting = false;
let isRefreshing = false;

// Queue for failed requests during token refresh
const failedQueue: Array<{
  resolve: (value: string | undefined) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token || undefined);
    }
  });
  
  failedQueue.length = 0;
};

// Clear auth redirect flags
export const clearAuthRedirectFlags = () => {
  sessionStorage.removeItem('auth_redirecting');
  isRedirecting = false;
};

// Function to handle authentication errors
const handleAuthError = () => {
  // Prevent multiple redirects
  if (isRedirecting) {
    console.log('[AUTH ERROR] Already redirecting, skipping duplicate redirect');
    return;
  }

  console.log('[AUTH ERROR] Handling 401 Unauthorized - clearing auth data and redirecting');
  isRedirecting = true;
  
  // Clear all authentication data from cookies
  deleteCookie('SA_access_token');
  deleteCookie('SA_access_token_initial');
  deleteCookie('SA_cognito_token');
  deleteCookie('SA_refresh_token');
  deleteCookie('SA_token_expires_at');
  deleteCookie('SA_user');
  deleteCookie('SA_business_id');
  
  // Clear any other auth-related data
  deleteCookie('agentBuilderCurrentStep');
  deleteCookie('agentBuilderData');
  deleteCookie('currentAgentId');

  // Clear localStorage and sessionStorage
  try { localStorage.clear(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  
  // Clear token service auto-refresh
  tokenService.clearAutoRefresh();
  
  // Set a flag to prevent further API calls during redirect
  try { sessionStorage.setItem('auth_redirecting', 'true'); } catch { /* ignore */ }
  
  // Redirect to login page after a brief delay to allow cleanup
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check if we're in the middle of a redirect
    if (sessionStorage.getItem('auth_redirecting') === 'true') {
      console.log('[API REQUEST] Blocking request during auth redirect:', config.url);
      return Promise.reject(new Error('Authentication redirect in progress'));
    }

    console.log('[API REQUEST]', config.method?.toUpperCase(), config.url);
    
    // Always use the immutable initial API token
    const token = getInitialApiAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[API REQUEST] Using initial API token for request');
    } else {
      console.warn('[API REQUEST] No initial API access token available');
      // Don't block the request, let the server handle authentication
    }
    
    // Add business_id from cookies as a header
    const businessId = getCookie('SA_business_id');
    
    // Only enforce business_id for protected endpoints
    const isProtected = config.url &&
      !config.url.startsWith('/login') &&
      !config.url.startsWith('/logout') &&
      !config.url.startsWith('/list-businesses');
      
    if (isProtected && !businessId) {
      console.warn('[API REQUEST] No business_id for protected endpoint:', config.url);
    }
    
    if (businessId) {
      config.headers['X-Business-Id'] = businessId;
    } else {
      delete config.headers['X-Business-Id'];
    }
    
    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[API RESPONSE]', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      console.error('[API RESPONSE ERROR]', error.response.config.url, error.response.status, error.response.data);
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        const currentPath = window.location.pathname;
        console.log('[API 401] Current path:', currentPath);

        // If this is a retry that still failed, logout immediately
        if (originalRequest && originalRequest._retry) {
          console.log('[API 401] Retried request still unauthorized. Logging out...');
          handleAuthError();
          return Promise.reject(error);
        }
        
        if (!currentPath.includes('/login') && 
            !isRedirecting &&
            sessionStorage.getItem('auth_redirecting') !== 'true') {
          
          // Maintain Cognito session, but DO NOT rotate API token
          if (!isRefreshing) {d
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
              console.log('[API 401] Attempting Cognito token refresh (without changing API token)...');
              const refreshedData = await tokenService.refreshTokens();
              
              if (refreshedData) {
                console.log('[API 401] Cognito refresh done. Retrying request with the same API token');
                const apiToken = getInitialApiAccessToken();
                if (apiToken) {
                  originalRequest.headers['Authorization'] = `Bearer ${apiToken}`;
                  processQueue(null, apiToken);
                  return api(originalRequest);
                }
                // No API token? fall through to auth error
                handleAuthError();
              } else {
                console.log('[API 401] Token refresh failed, redirecting to login');
                processQueue(new Error('Token refresh failed'), null);
                handleAuthError();
              }
            } catch (refreshError) {
              console.error('[API 401] Error during token refresh:', refreshError);
              processQueue(refreshError, null);
              handleAuthError();
            } finally {
              isRefreshing = false;
            }
          } else {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }
        } else {
          console.log('[API 401] Skipping redirect - already on login page or redirecting');
        }
      }
    } else if (error.message !== 'Authentication redirect in progress') {
      console.error('[API ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

// Utility function to handle API errors consistently
export const handleApiError = (error: unknown, context: string = 'API call') => {
  // Don't log 401 errors as they're handled by the API interceptor
  if (error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'status' in error.response &&
      error.response.status !== 401) {
    console.error(`Error in ${context}:`, error);
  }
};

// Utility function to retry failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 'status' in error.response) {
        const status = (error.response as any).status;
        if (status >= 400 && status < 500) {
          throw lastError;
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Utility function to handle offline scenarios
export const handleOfflineScenario = async <T>(
  requestFn: () => Promise<T>,
  fallbackData: T,
  context: string = 'API call'
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (!navigator.onLine) {
      console.warn(`[${context}] Offline - using fallback data`);
      return fallbackData;
    }
    throw error;
  }
};

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Utility function to deduplicate identical requests
export const deduplicatedRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5000 // 5 seconds TTL
): Promise<T> => {
  // Check if request is already in progress
  if (requestCache.has(key)) {
    console.log(`[API DEDUP] Using cached request for: ${key}`);
    return requestCache.get(key);
  }

  // Create new request
  const promise = requestFn().finally(() => {
    // Remove from cache after TTL
    setTimeout(() => {
      requestCache.delete(key);
    }, ttl);
  });

  requestCache.set(key, promise);
  return promise;
};

// Cookie-based auth utilities - now using standardized names and centralized functions
export const getAuthToken = (): string | null => {
  // Use immutable initial token for API calls (aligned with weaver-frontend)
  const initialToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN_INITIAL);
  const fallbackToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  return initialToken || fallbackToken;
};

export const clearAuthToken = (): void => {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.USER);
  deleteCookie(COOKIE_NAMES.BUSINESS_ID);
};

export const getUserData = (): any => {
  const userData = getCookie(COOKIE_NAMES.USER);
  return userData ? JSON.parse(userData) : null;
};

// Reset redirect flag when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    clearAuthRedirectFlags();
  });
  
  // Also clear flags when navigating away
  window.addEventListener('beforeunload', () => {
    clearAuthRedirectFlags();
  });
}

export default api;
