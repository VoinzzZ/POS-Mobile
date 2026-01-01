import api from "./axiosInstance";
import { Tokens } from "../services/tokenService";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  user_is_verified: boolean;
}


interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  details?: any;
}

interface LoginResponse extends ApiResponse {
  data: {
    user: User;
    tokens: Tokens;
  };
}

interface RegisterResponse extends ApiResponse {
  data: {
    user_id: number;
  };
}


/**
 * Register new user (step 1)
 * @param user_name - User's full name
 * @param pin - 6-digit PIN
 * @param email - User's email
 * @param role - User role (optional, default: "CASHIER")
 */
export const registerApi = async (
  user_name: string,
  pin: string,
  email: string,
  role?: string
): Promise<RegisterResponse> => {
  const res = await api.post("/auth/register", {
    user_name,
    pin,
    email,
    role: role || "CASHIER",
  });
  return res.data;
};

/**
 * Verify email OTP (step 2)
 * @param user_id - User ID from registration
 * @param otp_code - 6-digit OTP code from email
 */
export const verifyEmailOTPApi = async (
  user_id: number,
  otp_code: string
): Promise<ApiResponse> => {
  const res = await api.post("/auth/verify-email-code", { user_id, otp_code });
  return res.data;
};

/**
 * Set password (step 3 - final registration step)
 * @param user_id - User ID
 * @param new_password - New password
 */
export const setPasswordApi = async (
  user_id: number,
  new_password: string
): Promise<LoginResponse> => {
  const res = await api.post("/auth/set-password", { user_id, new_password });
  return res.data;
};

/**
 * Login user
 * @param email - User's email
 * @param password - User's password
 */
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

/**
 * Get user profile (requires authentication)
 */
export const getProfileApi = async (): Promise<
  ApiResponse<{ user: User }>
> => {
  const res = await api.get("/auth/profile");
  return res.data;
};

/**
 * Change password (requires authentication)
 * @param current_password - Current password
 * @param new_password - New password
 * @param confirm_password - Confirm new password
 */
export const changePasswordApi = async (
  current_password: string,
  new_password: string,
  confirm_password: string
): Promise<ApiResponse> => {
  const res = await api.post("/auth/change-password", {
    current_password,
    new_password,
    confirm_password,
  });
  return res.data;
};

/**
 * Refresh access token using refresh token
 * @param refresh_token - Current refresh token
 */
export const refreshTokenApi = async (refresh_token: string): Promise<{
  success: boolean;
  message: string;
  data: { tokens: Tokens };
}> => {
  const res = await api.post(
    "/auth/refresh-token",
    {},
    {
      headers: {
        Authorization: `Bearer ${refresh_token}`,
      },
    }
  );
  return res.data;
};

// ========== NEW REGISTRATION APIS ==========

// Owner Registration APIs
export interface TenantRegistrationData {
  tenant_name: string;
  tenant_phone?: string;
  tenant_email?: string;
  tenant_address?: string;
  tenant_description?: string;
}

export interface OwnerEmailData {
  registration_id: number;
  user_email: string;
  user_name: string;
  user_full_name?: string;
  user_phone?: string;
}

export interface EmployeeRegistrationData {
  pin_registration: string;
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone?: string;
  preferred_role?: string; // Role preference from frontend (admin, cashier, inventory)
}

export interface TenantRegistrationResponse extends ApiResponse {
  data: {
    registration_id: number;
    tenant_id: number;
  };
}

/**
 * Create tenant registration (Step 1 for owner)
 */
export const registerTenantApi = async (
  tenantData: TenantRegistrationData
): Promise<TenantRegistrationResponse> => {
  const res = await api.post("/registration/tenant", tenantData);
  return res.data;
};

/**
 * Send email verification for owner registration (Step 2 for owner)
 */
export const sendOwnerVerificationEmailApi = async (
  emailData: OwnerEmailData
): Promise<ApiResponse> => {
  const res = await api.post("/registration/verify-email", emailData);
  return res.data;
};

/**
 * Confirm email verification with OTP (Step 3 for both owner and employee)
 */
export const confirmEmailOtpApi = async (
  registration_id: number,
  otp_code: string
): Promise<ApiResponse> => {
  const res = await api.post("/registration/confirm-email", {
    registration_id,
    otp_code,
  });
  return res.data;
};

/**
 * Complete owner registration (Step 4 for owner)
 */
export const completeOwnerRegistrationApi = async (
  registration_id: number,
  user_password: string
): Promise<ApiResponse> => {
  const res = await api.post("/registration/complete", {
    registration_id,
    user_password,
  });
  return res.data;
};

/**
 * Complete employee registration (Step 3 for employee)
 */
export const completeEmployeeRegistrationApi = async (
  registration_id: number,
  user_password: string
): Promise<ApiResponse> => {
  const res = await api.post("/registration/complete", {
    registration_id,
    user_password,
  });
  return res.data;
};

/**
 * Validate employee PIN (Step 1 for employee)
 */
export const validateEmployeePinApi = async (
  pin: string
): Promise<ApiResponse> => {
  const res = await api.post("/registration/employee/validate-pin", { pin });
  return res.data;
};

/**
 * Register employee with PIN (Step 1 for employee)
 */
export const registerEmployeeWithPinApi = async (
  employeeData: EmployeeRegistrationData
): Promise<RegisterResponse> => {
  const res = await api.post("/registration/employee", employeeData);
  return res.data;
};

// Approval System APIs
export interface ApproveOwnerData {
  user_id: number;
  notes?: string;
}

export interface RejectOwnerData {
  user_id: number;
  rejection_reason: string;
}

export interface ApproveEmployeeData {
  user_id: number;
  role_id: number;
  notes?: string;
}

export interface RejectEmployeeData {
  user_id: number;
  rejection_reason: string;
}

/**
 * Get pending owner registrations (Super Admin only)
 */
export const getPendingOwnersApi = async (): Promise<
  ApiResponse<{ owners: any[] }>
> => {
  const res = await api.get("/approvals/pending-owners");
  return res.data;
};

/**
 * Get pending employee registrations (Owner only)
 */
export const getPendingEmployeesApi = async (): Promise<
  ApiResponse<{ employees: any[] }>
> => {
  const res = await api.get("/approvals/pending-employees");
  return res.data;
};

/**
 * Approve owner registration (Super Admin only)
 */
export const approveOwnerApi = async (data: ApproveOwnerData): Promise<ApiResponse> => {
  const res = await api.post("/approvals/sa-approve-owner", data);
  return res.data;
};

/**
 * Reject owner registration (Super Admin only)
 */
export const rejectOwnerApi = async (data: RejectOwnerData): Promise<ApiResponse> => {
  const res = await api.post("/approvals/sa-reject-owner", data);
  return res.data;
};

/**
 * Approve employee registration (Owner only)
 */
export const approveEmployeeApi = async (data: ApproveEmployeeData): Promise<ApiResponse> => {
  const res = await api.post("/approvals/owner-approve-employee", data);
  return res.data;
};

/**
 * Reject employee registration (Owner only)
 */
export const rejectEmployeeApi = async (data: RejectEmployeeData): Promise<ApiResponse> => {
  const res = await api.post("/approvals/owner-reject-employee", data);
  return res.data;
};

// User Management APIs
/**
 * Generate employee PIN (Owner only)
 */
export const generateEmployeePinApi = async (): Promise<
  ApiResponse<{ pin: string; expiresAt: string; pinId: number }>
> => {
  const res = await api.post("/users/generate-employee-pin");
  return res.data;
};

/**
 * Get employees by tenant (Owner only)
 */
export const getEmployeesApi = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  role?: string;
}): Promise<ApiResponse<{ employees: any[]; pagination: any }>> => {
  const res = await api.get("/users/employees", { params });
  return res.data;
};

/**
 * Update employee status (Owner only)
 */
export const updateEmployeeStatusApi = async (
  employeeId: number,
  isActive: boolean
): Promise<ApiResponse> => {
  const res = await api.patch(`/users/${employeeId}/status`, { isActive });
  return res.data;
};

/**
 * Delete employee (Owner only)
 */
export const deleteEmployeeApi = async (employeeId: number): Promise<ApiResponse> => {
  const res = await api.delete(`/users/${employeeId}`);
  return res.data;
};

/**
 * Get available roles
 */
export const getRolesApi = async (): Promise<ApiResponse<{ roles: any[] }>> => {
  const res = await api.get("/users/roles");
  return res.data;
};

/**
 * Get tenant info (requires authentication)
 */
export const getTenantInfoApi = async (): Promise<ApiResponse<{ tenant: any }>> => {
  const res = await api.get("/auth/tenant-info");
  return res.data;
};

// Note: isTokenExpiringSoon function has been moved to TokenService to avoid require cycles