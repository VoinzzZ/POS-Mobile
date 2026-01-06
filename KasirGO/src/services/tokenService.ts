import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenApi } from '../api/tokenRefresh';

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  tokenType?: string;
}

interface StoredTokens extends Tokens {
  issuedAt: number; // Timestamp when tokens were issued
}

export class TokenService {
  private static refreshPromise: Promise<Tokens> | null = null;
  private static lastRefreshAttempt: number = 0;
  private static refreshFailureCount: number = 0;
  private static readonly MAX_REFRESH_FAILURES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds between retries

  /**
   * Check if access token is about to expire (within 2 minutes)
   * @param expires_in - Token expiration time in seconds
   * @param issuedAt - Token issued timestamp (optional, defaults to current time)
   */
  static isTokenExpiringSoon = (expires_in: number, issuedAt?: number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    const tokenIssuedAt = issuedAt || now;
    const expirationTime = tokenIssuedAt + expires_in;
    const timeUntilExpiration = expirationTime - now;

    console.log('⏰ Token expiry check:', {
      now,
      tokenIssuedAt,
      expires_in,
      expirationTime,
      timeUntilExpiration,
      isExpiringSoon: timeUntilExpiration <= 120
    });

    // Return true if token expires within 2 minutes (120 seconds)
    return timeUntilExpiration <= 120;
  };

  /**
   * Get stored tokens from AsyncStorage
   */
  static async getStoredTokens(): Promise<StoredTokens | null> {
    try {
      const tokensStr = await AsyncStorage.getItem('@tokens');
      console.log('🔍 Retrieved tokens from storage:', tokensStr ? 'Found' : 'Not found');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        console.log('🔍 Parsed tokens:', {
          has_access_token: !!tokens.access_token,
          has_refresh_token: !!tokens.refresh_token,
          issuedAt: tokens.issuedAt,
          expires_in: tokens.expires_in,
          refresh_expires_in: tokens.refresh_expires_in,
          accessTokenStart: tokens.access_token ? tokens.access_token.substring(0, 30) + '...' : 'none',
          refreshTokenStart: tokens.refresh_token ? tokens.refresh_token.substring(0, 30) + '...' : 'none'
        });
        return tokens;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting stored tokens:', error);
      return null;
    }
  }

  /**
   * Store tokens in AsyncStorage with timestamp
   */
  static async storeTokens(tokens: Tokens): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const tokensWithTimestamp: StoredTokens = {
        ...tokens,
        issuedAt: now
      };

      console.log('💾 Storing tokens:', {
        has_access_token: !!tokens.access_token,
        has_refresh_token: !!tokens.refresh_token,
        expires_in: tokens.expires_in,
        refresh_expires_in: tokens.refresh_expires_in,
        issuedAt: now
      });

      await AsyncStorage.setItem('@tokens', JSON.stringify(tokensWithTimestamp));
      console.log('✅ Tokens stored successfully');

      // Verify storage immediately
      const stored = await AsyncStorage.getItem('@tokens');
      console.log('🔍 Verification - stored tokens:', stored ? 'Present' : 'Missing');

      // Test immediate retrieval
      const immediateRetrieval = await this.getStoredTokens();
      console.log('🔍 Immediate retrieval test:', {
        found: !!immediateRetrieval,
        hasAccess: !!immediateRetrieval?.access_token,
        hasRefresh: !!immediateRetrieval?.refresh_token
      });

    } catch (error) {
      console.error('❌ Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Check if current access token is valid and not expiring soon
   */
  static async isAccessTokenValid(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.access_token) {
        console.log('❌ No tokens or access_token found');
        return false;
      }

      // Check if token is expiring soon (within 2 minutes)
      const isExpiring = this.isTokenExpiringSoon(tokens.expires_in, tokens.issuedAt);
      console.log('🔍 Token expiry check:', {
        expires_in: tokens.expires_in,
        issuedAt: tokens.issuedAt,
        isExpiringSoon: isExpiring,
        isValid: !isExpiring
      });
      return !isExpiring;
    } catch (error) {
      console.error('❌ Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Get current valid access token, refresh if necessary
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      console.log('🔍 Getting valid access token...');
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        console.log('❌ No tokens found in getValidAccessToken');
        return null;
      }

      // If access token is still valid, return it
      if (!this.isTokenExpiringSoon(tokens.expires_in, tokens.issuedAt)) {
        console.log('✅ Access token is valid, returning it');
        return tokens.access_token;
      }

      // Token is expiring soon or expired, refresh it
      console.log('🔄 Access token expiring soon, refreshing...');
      const newTokens = await this.refreshAccessToken();
      return newTokens?.access_token || null;
    } catch (error) {
      console.error('❌ Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token with retry limit
   */
  static async refreshAccessToken(): Promise<Tokens | null> {
    try {
      // If refresh has failed too many times, give up and require re-login
      if (this.refreshFailureCount >= this.MAX_REFRESH_FAILURES) {
        console.log('🛑 Max refresh attempts reached. Clearing tokens and requiring login');
        await this.clearTokens();
        return null;
      }

      // If there's already a refresh in progress, wait for it
      if (this.refreshPromise) {
        console.log('⏳ Refresh already in progress, waiting...');
        return await this.refreshPromise;
      }

      // Check if enough time has passed since last attempt
      const now = Date.now();
      const timeSinceLastAttempt = now - this.lastRefreshAttempt;
      if (timeSinceLastAttempt < this.RETRY_DELAY && this.refreshFailureCount > 0) {
        console.log(`⏳ Refresh rate limited. Wait ${Math.ceil((this.RETRY_DELAY - timeSinceLastAttempt) / 1000)}s`);
        return null;
      }

      const tokens = await this.getStoredTokens();
      console.log('🔍 Tokens for refresh:', {
        found: !!tokens,
        properties: tokens ? Object.keys(tokens) : null,
        hasAccess: !!tokens?.access_token,
        hasRefresh: !!tokens?.refresh_token,
        refreshTokenStart: tokens?.refresh_token ? tokens.refresh_token.substring(0, 30) + '...' : 'none'
      });

      if (!tokens || !tokens.refresh_token) {
        console.log('❌ No refresh token available');
        // Reset failure count when there's no refresh token to start fresh after login
        this.refreshFailureCount = 0;
        return null;
      }

      // Check if refresh token itself is expired
      const now_sec = Math.floor(Date.now() / 1000);
      const refreshTokenExpirationTime = tokens.issuedAt + tokens.refresh_expires_in;
      if (now_sec > refreshTokenExpirationTime) {
        console.log('❌ Refresh token has expired. Requires re-login');
        this.refreshFailureCount = this.MAX_REFRESH_FAILURES;
        await this.clearTokens();
        return null;
      }

      // Start the refresh process
      this.lastRefreshAttempt = Date.now();
      this.refreshPromise = this.performTokenRefresh(tokens.refresh_token);

      try {
        const newTokens = await this.refreshPromise;
        if (newTokens) {
          this.refreshFailureCount = 0; // Reset on success
        } else {
          this.refreshFailureCount++;
        }
        return newTokens;
      } finally {
        // Clear the promise when done
        this.refreshPromise = null;
      }
    } catch (error) {
      this.refreshFailureCount++;
      console.error('❌ Error refreshing access token:', error);
      this.refreshPromise = null;
      return null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private static async performTokenRefresh(refreshToken: string): Promise<Tokens> {
    try {
      console.log('📤 Calling refresh token API...');
      const response = await refreshTokenApi(refreshToken);

      if (response.success && response.data?.tokens) {
        const newTokens = {
          access_token: response.data.tokens.access_token,
          refresh_token: response.data.tokens.refresh_token,
          expires_in: response.data.tokens.expires_in,
          refresh_expires_in: response.data.tokens.refresh_expires_in,
        };
        await this.storeTokens(newTokens);
        console.log('✅ Tokens refreshed and stored successfully');
        return newTokens;
      } else {
        throw new Error('Invalid refresh token response');
      }
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
        console.log('❌ Error refreshing access token: Backend is offline');
      } else if (error.response?.status === 404) {
        console.log('❌ Error refreshing access token: Endpoint not found (404)');
      } else {
        console.log('❌ Error refreshing access token:', error.message);
      }
      throw error;
    }
  }

  /**
   * Clear all stored tokens (logout)
   */
  static async clearTokens(): Promise<void> {
    try {
      console.log('🗑️ Clearing tokens...');

      // Check what's being cleared
      const existingTokens = await AsyncStorage.getItem('@tokens');
      const existingUser = await AsyncStorage.getItem('@user');

      console.log('🗑️ About to clear:', {
        hasTokens: !!existingTokens,
        hasUser: !!existingUser
      });

      await AsyncStorage.removeItem('@tokens');
      await AsyncStorage.removeItem('@user');

      // Verify clearing
      const afterClearTokens = await AsyncStorage.getItem('@tokens');
      const afterClearUser = await AsyncStorage.getItem('@user');

      console.log('✅ All tokens cleared. Verification:', {
        tokensGone: !afterClearTokens,
        userGone: !afterClearUser
      });
    } catch (error) {
      console.error('❌ Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Check if refresh token is still valid (not expired)
   */
  static async isRefreshTokenValid(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.refresh_token) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const refreshTokenExpiration = tokens.issuedAt + tokens.refresh_expires_in;

      return now < refreshTokenExpiration;
    } catch (error) {
      console.error('❌ Error checking refresh token validity:', error);
      return false;
    }
  }
}

// Debug function to test AsyncStorage
export async function testAsyncStorage() {
  try {
    const testKey = '@test_storage';
    const testValue = { test: 'working', timestamp: Date.now() };

    console.log('🧪 Testing AsyncStorage...');

    // Write test
    await AsyncStorage.setItem(testKey, JSON.stringify(testValue));
    console.log('✅ AsyncStorage write test passed');

    // Read test
    const retrieved = await AsyncStorage.getItem(testKey);
    const parsed = retrieved ? JSON.parse(retrieved) : null;
    console.log('✅ AsyncStorage read test passed:', parsed);

    // Cleanup
    await AsyncStorage.removeItem(testKey);
    console.log('✅ AsyncStorage cleanup test passed');

    return true;
  } catch (error) {
    console.error('❌ AsyncStorage test failed:', error);
    return false;
  }
}

export default TokenService;