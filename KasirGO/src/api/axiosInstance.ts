import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import TokenService from "../services/tokenService";

// console.log('🔗 API_URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
  },
});

// Request interceptor - add valid token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (config.url?.includes('/auth/login') ||
        config.url?.includes('/auth/register') ||
        config.url?.includes('/auth/set-password') ||
        config.url?.includes('/auth/refresh-token') ||
        config.url?.includes('/registration/employee/validate-pin')) {
        return config;
      }

      const accessToken = await TokenService.getValidAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        console.log('⚠️  No valid token available for request:', config.url);
        // Reject the request instead of letting it go through without a token
        // This prevents the 401 loop when tokens don't exist
        return Promise.reject(new Error('No authentication token available. Please login.'));
      }
    } catch (error) {
      console.error("❌ Error getting valid token:", error);
      return Promise.reject(error);
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
    console.log('Axios Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip token refresh for auth and registration validation endpoints to avoid infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/set-password') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/registration/employee/validate-pin');

    // Handle 401 errors (token expired) with retry mechanism, but skip for auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh token using TokenService...');

        // Use TokenService to refresh token
        const newTokens = await TokenService.refreshAccessToken();

        if (newTokens && newTokens.access_token) {
          console.log('Token refreshed successfully via TokenService');

          // Update original request with new access token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          }

          console.log('Retrying original request...');
          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError: any) {
        console.log('Token refresh failed:', {
          message: refreshError.message,
          response: refreshError.response?.data,
          status: refreshError.response?.status
        });

        // Clear auth data using TokenService
        await TokenService.clearTokens();

        // Return a descriptive error
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    // For login endpoint specifically, if it returns 401, don't try to refresh token
    if (error.response?.status === 401 && isAuthEndpoint && originalRequest.url?.includes('/auth/login')) {
      console.log('Login failed with 401 - clearing tokens and returning error');
      await TokenService.clearTokens();
      return Promise.reject(new Error('Invalid credentials. Please check your email and password.'));
    }

    return Promise.reject(error);
  }
);

export default api;
