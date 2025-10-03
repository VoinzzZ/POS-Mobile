import api from "./axiosInstance";

export interface User {
  id: number;
  userName: string;
  email: string;
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
    totalUsers: number;
    adminCount: number;
    cashierCount: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  };
}

export interface GeneratePinResponse {
  success: boolean;
  message: string;
  data: {
    pin: string;
    expiresAt: string;
  };
}

export interface Pin {
  id: number;
  code: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  createdBy: {
    id: number;
    userName: string;
    email: string;
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
    activePins: number;
    usedPins: number;
    expiredPins: number;
    recentActivity: any[];
  };
}

// Get all users
export const getAllUsers = async (role?: string, page: number = 1, limit: number = 50): Promise<UsersResponse> => {
  const params: any = { page, limit };
  if (role) params.role = role;
  
  const response = await api.get("/admin/users", { params });
  return response.data;
};

// Get user statistics
export const getUserStats = async (): Promise<UserStatsResponse> => {
  const response = await api.get("/admin/users/stats");
  return response.data;
};

// Generate registration PIN
export const generatePin = async (expiresInHours: number = 24): Promise<GeneratePinResponse> => {
  const response = await api.post("/admin/generate-pin", { expiresInHours });
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
export const revokePin = async (pinId: number): Promise<any> => {
  const response = await api.delete(`/admin/pins/${pinId}`);
  return response.data;
};

// Get PIN statistics
export const getPinStats = async (): Promise<PinStatsResponse> => {
  const response = await api.get("/admin/pins/stats");
  return response.data;
};
