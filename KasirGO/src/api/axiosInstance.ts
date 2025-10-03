import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
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
        }
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
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
        await AsyncStorage.removeItem("@tokens");
        await AsyncStorage.removeItem("@user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
