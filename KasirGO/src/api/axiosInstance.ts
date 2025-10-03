import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

console.log('🔗 API_URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
  },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const tokensStr = await AsyncStorage.getItem("@tokens");
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          console.log('✅ Token added to request:', config.url);
        } else {
          console.log('⚠️  No accessToken in stored tokens');
        }
      } else {
        console.log('⚠️  No tokens found in AsyncStorage for request:', config.url);
      }
    } catch (error) {
      console.error("❌ Error getting token from storage:", error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.log('🚨 Axios Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokensStr = await AsyncStorage.getItem("@tokens");
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);

          const response = await axios.post(
            `${API_URL}/auth/refresh-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${tokens.refreshToken}`,
              },
            }
          );

          if (response.data.success) {
            const newTokens = response.data.data.tokens;
            await AsyncStorage.setItem("@tokens", JSON.stringify(newTokens));

            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('❌ Refresh token failed, clearing auth and redirecting to login');
        await AsyncStorage.removeItem("@tokens");
        await AsyncStorage.removeItem("@user");
        // Redirect to login will happen automatically via AuthContext
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
