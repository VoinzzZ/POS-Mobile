import api from "./axiosInstance";

export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  user_is_verified: boolean;
  user_is_active: boolean;
  user_created_at: string;
  user_updated_at: string;

  id: number;
  userName: string;
  userEmail: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
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
    active_users: number;
    inactive_users: number;
  };
}

export interface GeneratePinResponse {
  success: boolean;
  message: string;
  data: {
    pin: string;
    expiresAt: string;
    pinId: number;
  };
}

export interface PinHistory {
  id: number;
  code: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  revokedAt?: string;
  currentUses: number;
  maxUses: number;
  createdBy?: string;
  createdAt: string;
  status: string;
}

export interface PinHistoryResponse {
  success: boolean;
  message: string;
  data: {
    pins: PinHistory[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface RevokePinResponse {
  success: boolean;
  message: string;
}

// Get all employees for tenant
export const getAllUsers = async (role?: string, page: number = 1, limit: number = 50): Promise<UsersResponse> => {
  const params: any = { page, limit };
  if (role) params.role = role;

  const response = await api.get("/users/employees", { params });

  // Transform response to match expected format
  if (response.data.success && response.data.data) {
    // Check if users array exists in response
    const users = response.data.data.users || [];

    const transformedUsers = users.map((user: any) => ({
      ...user,
      id: user.user_id,
      userName: user.user_name,
      userEmail: user.user_email,
      role: user.user_role,
      isVerified: user.user_is_verified,
      isActive: user.user_is_active !== undefined ? user.user_is_active : true, // Default to true if not present
      createdAt: user.user_created_at,
      updatedAt: user.user_updated_at,
    }));

    return {
      ...response.data,
      data: {
        ...response.data.data,
        users: transformedUsers
      }
    };
  }

  // Return empty users array if success is false or data doesn't exist
  return {
    success: response.data.success || false,
    message: response.data.message || 'Unknown error occurred',
    data: {
      users: [],
      pagination: {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
      }
    }
  };
};

// Get employee statistics
export const getUserStats = async (): Promise<UserStatsResponse> => {
  const response = await api.get("/users/employees/stats");

  // Ensure response has proper structure
  if (response.data.success && response.data.data) {
    // Provide default values if specific stats are missing
    const defaultStats = {
      total_users: 0,
      admin_count: 0,
      cashier_count: 0,
      verified_users: 0,
      unverified_users: 0,
      active_users: 0,
      inactive_users: 0
    };

    return {
      ...response.data,
      data: {
        ...defaultStats,
        ...response.data.data
      }
    };
  }

  return {
    success: response.data.success || false,
    message: response.data.message || 'Unknown error occurred',
    data: {
      total_users: 0,
      admin_count: 0,
      cashier_count: 0,
      verified_users: 0,
      unverified_users: 0,
      active_users: 0,
      inactive_users: 0
    }
  };
};

// Generate registration PIN for employee
export const generatePin = async (expires_in_hours: number = 24): Promise<GeneratePinResponse> => {
  const response = await api.post("/users/generate-employee-pin", { expires_in_hours });
  return response.data;
};

// Get users by role
export const getUsersByRole = async (role: string, page: number = 1, limit: number = 50): Promise<UsersResponse> => {
  const params: any = { page, limit };

  const response = await api.get(`/users/roles/${role}/users`, { params });

  // Transform response to match expected format
  if (response.data.success && response.data.data) {
    // Check if users array exists in response
    const users = response.data.data.users || [];

    const transformedUsers = users.map((user: any) => ({
      ...user,
      id: user.user_id,
      userName: user.user_name,
      userEmail: user.user_email,
      role: user.user_role,
      isVerified: user.user_is_verified,
      isActive: user.user_is_active !== undefined ? user.user_is_active : true, // Default to true if not present
      createdAt: user.user_created_at,
      updatedAt: user.user_updated_at,
    }));

    return {
      ...response.data,
      data: {
        ...response.data.data,
        users: transformedUsers
      }
    };
  }

  // Return empty users array if success is false or data doesn't exist
  return {
    success: response.data.success || false,
    message: response.data.message || 'Unknown error occurred',
    data: {
      users: [],
      pagination: {
        total: 0,
        page: page,
        limit: limit,
        totalPages: 0
      }
    }
  };
};

// Get PIN history
export const getPinHistory = async (page: number = 1, limit: number = 10, status?: string): Promise<PinHistoryResponse> => {
  const params: any = { page, limit };
  if (status) params.status = status;

  const response = await api.get("/users/pins/history", { params });
  return response.data;
};

// Revoke PIN
export const revokePin = async (pinId: number): Promise<RevokePinResponse> => {
  const response = await api.patch(`/users/pins/${pinId}/revoke`);
  return response.data;
};

