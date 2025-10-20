import api from "./axiosInstance";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  user_is_verified: boolean;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
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

/**
 * Check if access token is about to expire (within 2 minutes)
 * @param expires_in - Token expiration time in seconds
 * @param issuedAt - Token issued timestamp (optional, defaults to current time)
 */
export const isTokenExpiringSoon = (expires_in: number, issuedAt?: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const tokenIssuedAt = issuedAt || now;
  const expirationTime = tokenIssuedAt + expires_in;
  const timeUntilExpiration = expirationTime - now;
  
  // Return true if token expires within 2 minutes (120 seconds)
  return timeUntilExpiration <= 120;
};