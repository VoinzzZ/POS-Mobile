import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenApi } from '../api/tokenRefresh';

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType?: string;
}

interface StoredTokens extends Tokens {
  issuedAt: number; // Timestamp when tokens were issued
}

export class TokenService {
  private static refreshPromise: Promise<Tokens> | null = null;

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

    // Return true if token expires within 2 minutes (120 seconds)
    return timeUntilExpiration <= 120;
  };

  /**
   * Get stored tokens from AsyncStorage
   */
  static async getStoredTokens(): Promise<StoredTokens | null> {
    try {
      const tokensStr = await AsyncStorage.getItem('@tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
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
      const tokensWithTimestamp: StoredTokens = {
        ...tokens,
        issuedAt: Math.floor(Date.now() / 1000)
      };
      await AsyncStorage.setItem('@tokens', JSON.stringify(tokensWithTimestamp));
      console.log('✅ Tokens stored successfully');
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
      if (!tokens || !tokens.accessToken) {
        return false;
      }

      // Check if token is expiring soon (within 2 minutes)
      return !this.isTokenExpiringSoon(tokens.expiresIn, tokens.issuedAt);
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
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        console.log('ℹ️ No tokens found');
        return null;
      }

      // If access token is still valid, return it
      if (!this.isTokenExpiringSoon(tokens.expiresIn, tokens.issuedAt)) {
        return tokens.accessToken;
      }

      // Token is expiring soon or expired, refresh it
      console.log('🔄 Access token expiring soon, refreshing...');
      const newTokens = await this.refreshAccessToken();
      return newTokens?.accessToken || null;
    } catch (error) {
      console.error('❌ Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<Tokens | null> {
    try {
      // If there's already a refresh in progress, wait for it
      if (this.refreshPromise) {
        console.log('⏳ Refresh already in progress, waiting...');
        return await this.refreshPromise;
      }

      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.refreshToken) {
        console.log('❌ No refresh token available');
        return null;
      }

      // Start the refresh process
      this.refreshPromise = this.performTokenRefresh(tokens.refreshToken);
      
      try {
        const newTokens = await this.refreshPromise;
        return newTokens;
      } finally {
        // Clear the promise when done
        this.refreshPromise = null;
      }
    } catch (error) {
      console.error('❌ Error refreshing access token:', error);
      this.refreshPromise = null;
      return null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private static async performTokenRefresh(refreshToken: string): Promise<Tokens> {
    console.log('📤 Calling refresh token API...');
    const response = await refreshTokenApi(refreshToken);
    
    if (response.success && response.data?.tokens) {
      const newTokens = response.data.tokens;
      await this.storeTokens(newTokens);
      console.log('✅ Tokens refreshed and stored successfully');
      return newTokens;
    } else {
      throw new Error('Invalid refresh token response');
    }
  }

  /**
   * Clear all stored tokens (logout)
   */
  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@tokens');
      await AsyncStorage.removeItem('@user');
      console.log('✅ All tokens cleared');
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
      if (!tokens || !tokens.refreshToken) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const refreshTokenExpiration = tokens.issuedAt + tokens.refreshExpiresIn;
      
      return now < refreshTokenExpiration;
    } catch (error) {
      console.error('❌ Error checking refresh token validity:', error);
      return false;
    }
  }
}

export default TokenService;