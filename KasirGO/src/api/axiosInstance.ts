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
      // Skip token for auth endpoints to avoid infinite loops
      if (config.url?.includes('/auth/login') || 
          config.url?.includes('/auth/register') ||
          config.url?.includes('/auth/refresh-token')) {
        return config;
      }

      // Get a valid access token (will refresh if needed)
      const accessToken = await TokenService.getValidAccessToken();
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('✅ Valid token added to request:', config.url);
      } else {
        console.log('⚠️  No valid token available for request:', config.url);
      }
    } catch (error) {
      console.error("❌ Error getting valid token:", error);
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
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors (token expired) with retry mechanism
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh token using TokenService...');
        
        // Use TokenService to refresh token
        const newTokens = await TokenService.refreshAccessToken();
        
        if (newTokens && newTokens.accessToken) {
          console.log('Token refreshed successfully via TokenService');
          
          // Update original request with new access token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
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

    return Promise.reject(error);
  }
);

export default api;
