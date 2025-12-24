import axios from "axios";
import { API_URL } from "@env";

interface TokenRefreshResponse {
  success: boolean;
  message: string;
  data: {
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      refresh_expires_in: number;
    };
  };
}

/**
 * Refresh access token using refresh token
 * @param refresh_token - Current refresh token
 */
export const refreshTokenApi = async (refresh_token: string): Promise<TokenRefreshResponse> => {
  console.log('🔄 Making refresh token API call:', {
    url: `${API_URL}/auth/refresh-token`,
    hasRefreshToken: !!refresh_token,
    tokenLength: refresh_token ? refresh_token.length : 0,
    tokenStart: refresh_token ? refresh_token.substring(0, 50) + '...' : 'none'
  });

  try {
    const res = await axios.post(
      `${API_URL}/auth/refresh-token`,
      { refreshToken: refresh_token }, // Send refresh token in request body
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log('✅ Refresh token API response:', {
      status: res.status,
      success: res.data?.success,
      hasTokens: !!res.data?.data?.tokens,
      hasAccessToken: !!res.data?.data?.tokens?.access_token
    });

    return res.data;
  } catch (error: any) {
    console.log('❌ Refresh token API error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    throw error;
  }
};