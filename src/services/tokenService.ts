import { 
  getStoredTokenData, 
  needsTokenRefresh, 
  type TokenData,
  getInitialApiAccessToken,
  refreshTokens as authRefreshTokens
} from '@/utils/authUtils';

class TokenService {
  private refreshPromise: Promise<TokenData | null> | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Returns the immutable API access token captured at initial login
   * Refresh is only used to maintain Cognito session, not to rotate API token
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      if (needsTokenRefresh()) {
        console.log('[TokenService] Tokens need refresh (Cognito only), attempting to refresh...');
        await this.refreshTokens();
      }
      const apiToken = getInitialApiAccessToken();
      if (!apiToken) {
        console.log('[TokenService] No initial API access token available');
      }
      return apiToken;
    } catch (error) {
      console.error('[TokenService] Error getting API access token:', error);
      return getInitialApiAccessToken();
    }
  }

  /**
   * Refreshes Cognito session tokens without changing the API access token
   */
  async refreshTokens(): Promise<TokenData | null> {
    if (this.refreshPromise) {
      console.log('[TokenService] Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }
    this.refreshPromise = (async () => {
      try {
        console.log('[TokenService] Refreshing tokens (Cognito session maintenance)...');
        const result = await authRefreshTokens();
        
        if (!result) {
          console.log('[TokenService] Token refresh failed - Cognito session expired');
          // Clear auto-refresh since tokens are no longer valid
          this.clearAutoRefresh();
          return null;
        }
        
        return result;
      } catch (error) {
        console.error('[TokenService] Error during token refresh:', error);
        // Clear auto-refresh since tokens are no longer valid
        this.clearAutoRefresh();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  /**
   * Sets up automatic token refresh before expiration (aligned with weaver-frontend)
   * - Runs every 4 minutes
   * - Checks if tokens need refresh (5-minute buffer)
   * - Uses AWS Amplify to refresh tokens
   * - Updates cookies with new tokens
   * - Maintains session without user interaction
   */
  setupAutoRefresh(): void {
    if (this.refreshTimeout) {
      clearInterval(this.refreshTimeout);
    }

    const checkAndRefresh = async () => {
      try {
        const tokenData = getStoredTokenData();
        if (!tokenData) {
          console.log('[TokenService] No token data available for auto-refresh setup');
          return;
        }
        if (tokenData && needsTokenRefresh()) {
          console.log('[TokenService] Tokens need refresh (5-minute buffer), refreshing...');
          const refreshResult = await this.refreshTokens();
          
          if (!refreshResult) {
            console.log('[TokenService] Token refresh failed, stopping auto-refresh');
            this.clearAutoRefresh();
            return;
          }
        } else {
          console.log('[TokenService] Tokens are still valid, no refresh needed');
        }
      } catch (error) {
        console.error('[TokenService] Error in token refresh check:', error);
        // Stop auto-refresh on persistent errors
        this.clearAutoRefresh();
      }
    };

    // Check every 4 minutes (240 seconds) for token refresh needs
    this.refreshTimeout = setInterval(checkAndRefresh, 4 * 60 * 1000);
    console.log('[TokenService] Token refresh service started (4-minute intervals, 5-minute buffer)');
  }

  /**
   * Clears the auto-refresh interval
   */
  clearAutoRefresh(): void {
    if (this.refreshTimeout) {
      clearInterval(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Checks if tokens are valid and not expiring soon
   */
  isTokenValid(): boolean {
    const tokenData = getStoredTokenData();
    if (!tokenData) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 5 * 60; // 5 minutes buffer
    
    return (tokenData.expiresAt - currentTime) > bufferTime;
  }

  /**
   * Gets the time until token expiration in seconds
   */
  getTimeUntilExpiry(): number {
    const tokenData = getStoredTokenData();
    if (!tokenData) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, tokenData.expiresAt - currentTime);
  }

  /**
   * Initializes the token service with stored data (aligned with weaver-frontend)
   */
  initialize(): void {
    if (this.isInitialized) return;
    const tokenData = getStoredTokenData();
    if (tokenData) {
      console.log('[TokenService] Initializing with stored token data');
      this.setupAutoRefresh();
    }
    this.isInitialized = true;
  }

  /**
   * Forces a token refresh regardless of expiration
   */
  async forceRefresh(): Promise<TokenData | null> {
    console.log('[TokenService] Force refreshing tokens (Cognito session maintenance)...');
    return this.refreshTokens();
  }
}

// Export a singleton instance
export const tokenService = new TokenService();
export default tokenService;
