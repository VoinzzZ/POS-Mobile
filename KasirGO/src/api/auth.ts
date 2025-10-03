import api from "./axiosInstance";

interface User {
  userId: number;
  userName: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
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
    userId: number;
  };
}


/**
 * Register new user (step 1)
 * @param userName - User's full name
 * @param pin - 6-digit PIN
 * @param email - User's email
 * @param role - User role (optional, default: "CASHIER")
 */
export const registerApi = async (
  userName: string,
  pin: string,
  email: string,
  role?: string
): Promise<RegisterResponse> => {
  const res = await api.post("/auth/register", {
    userName,
    pin,
    email,
    role: role || "CASHIER",
  });
  return res.data;
};

/**
 * Verify email OTP (step 2)
 * @param userId - User ID from registration
 * @param otpCode - 6-digit OTP code from email
 */
export const verifyEmailOTPApi = async (
  userId: number,
  otpCode: string
): Promise<ApiResponse> => {
  const res = await api.post("/auth/verify-email-code", { userId, otpCode });
  return res.data;
};

/**
 * Set password (step 3 - final registration step)
 * @param userId - User ID
 * @param newPassword - New password
 */
export const setPasswordApi = async (
  userId: number,
  newPassword: string
): Promise<LoginResponse> => {
  const res = await api.post("/auth/set-password", { userId, newPassword });
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
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - Confirm new password
 */
export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> => {
  const res = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return res.data;
};
