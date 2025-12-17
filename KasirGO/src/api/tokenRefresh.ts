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
  const res = await axios.post(
    `${API_URL}/auth/refresh-token`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refresh_token}`,
      },
      timeout: 30000,
    }
  );
  return res.data;
};