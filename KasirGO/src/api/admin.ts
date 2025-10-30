import api from "./axiosInstance";
import { transformUsers } from "../utils/dataTransform";

export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: "ADMIN" | "CASHIER";
  user_is_verified: boolean;
  user_created_at: string;
  user_updated_at: string;

  // CamelCase aliases for frontend use
  id: number;
  userName: string;
  userEmail: string;
  role: "ADMIN" | "CASHIER";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: {
    total_users: number;
    admin_count: number;
    cashier_count: number;
    verified_users: number;
    unverified_users: number;
  };
}

export interface GeneratePinResponse {
  success: boolean;
  message: string;
  data: {
    pin: string;
    expires_at: string;
  };
}

export interface Pin {
  pin_id: number;
  pin_code: string;
  pin_used: boolean;
  expires_at: string;
  created_at: string;
  createdBy: {
    user_id: number;
    user_name: string;
    user_email: string;
  };
}

export interface PinsResponse {
  success: boolean;
  message: string;
  data: {
    pins: Pin[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PinStatsResponse {
  success: boolean;
  message: string;
  data: {
    active_pins: number;
    used_pins: number;
    expired_pins: number;
    recent_activity: any[];
  };
}

// Get all users
export const getAllUsers = async (role?: string, page: number = 1, limit: number = 50): Promise<UsersResponse> => {
  const params: any = { page, limit };
  if (role) params.role = role;

  const response = await api.get("/admin/users", { params });

  // Transform the server data to add camelCase aliases
  if (response.data.success && response.data.data) {
    const transformedData = {
      ...response.data,
      data: {
        ...response.data.data,
        users: transformUsers(response.data.data.users)
      }
    };
    return transformedData;
  }

  return response.data;
};

// Get user statistics
export const getUserStats = async (): Promise<UserStatsResponse> => {
  const response = await api.get("/admin/users/stats");
  return response.data;
};

// Generate registration PIN
export const generatePin = async (expires_in_hours: number = 24): Promise<GeneratePinResponse> => {
  const response = await api.post("/admin/generate-pin", { expires_in_hours });
  return response.data;
};

// Get all PINs
export const getAllPins = async (status?: string, page: number = 1, limit: number = 10): Promise<PinsResponse> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  
  const response = await api.get("/admin/pins", { params });
  return response.data;
};

// Revoke a PIN
export const revokePin = async (pin_id: number): Promise<any> => {
  const response = await api.delete(`/admin/pins/${pin_id}`);
  return response.data;
};

// Get PIN statistics
export const getPinStats = async (): Promise<PinStatsResponse> => {
  const response = await api.get("/admin/pins/stats");
  return response.data;
};