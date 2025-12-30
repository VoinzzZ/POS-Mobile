import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginApi,
  registerApi,
  verifyEmailOTPApi,
  setPasswordApi,
  getProfileApi,
  registerTenantApi,
  sendOwnerVerificationEmailApi,
  confirmEmailOtpApi,
  completeOwnerRegistrationApi,
  registerEmployeeWithPinApi,
  TenantRegistrationData,
  OwnerEmailData,
  EmployeeRegistrationData,
} from "../api/auth";
import TokenService, { testAsyncStorage } from "../services/tokenService";

// Define Tokens interface to match the one in tokenService
interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  tokenType?: string;
}

// ========== TYPES ==========

// Extended User interface to support multi-tenant
interface User {
  id?: number; // For backward compatibility
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string; // Using string to match API response, then validate specific values
  user_is_verified: boolean;
  tenantId?: number;
  tenantName?: string;
  roleId?: number;
  isSA?: boolean;
  lastLogin?: string;

  // New API response properties for compatibility
  name?: string; // Alternative to user_name
  email?: string; // Alternative to user_email
  role?: string; // Alternative to user_role - using string to match API
  isVerified?: boolean; // Alternative to user_is_verified
}


// Registration data types are imported from auth API

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;

  // Legacy registration (for backward compatibility)
  register: (
    user_name: string,
    pin: string,
    email: string
  ) => Promise<{ user_id: number }>;
  verifyEmail: (user_id: number, otp_code: string) => Promise<void>;
  setPassword: (user_id: number, new_password: string) => Promise<void>;

  // New owner registration flow
  registerOwnerTenant: (tenantData: TenantRegistrationData) => Promise<{ registration_id: number; tenant_id: number }>;
  sendOwnerEmailVerification: (emailData: OwnerEmailData) => Promise<any>;
  confirmEmailVerification: (registration_id: number, otp_code: string) => Promise<void>;
  completeOwnerRegistration: (registration_id: number, password: string) => Promise<void>;

  // New employee registration flow
  registerEmployeeWithPin: (employeeData: EmployeeRegistrationData) => Promise<{ user_id: number }>;

  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => ({ user_id: 0 }),
  verifyEmail: async () => {},
  setPassword: async () => {},
  registerOwnerTenant: async () => ({ registration_id: 0, tenant_id: 0 }),
  sendOwnerEmailVerification: async () => {},
  confirmEmailVerification: async () => {},
  completeOwnerRegistration: async () => {},
  registerEmployeeWithPin: async () => ({ registration_id: 0 }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  const loadAuthFromStorage = async () => {
    try {
      console.log('🔍 Loading auth from storage...');

      // Test AsyncStorage first
      await testAsyncStorage();

      const userStr = await AsyncStorage.getItem("@user");
      const tokens = await TokenService.getStoredTokens();

      console.log('🔍 Auth storage results:', {
        hasUser: !!userStr,
        hasTokens: !!tokens
      });

      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
        console.log('✅ User loaded:', user.user_email);
      }

      if (tokens) {
        setTokens(tokens);
        console.log('✅ Tokens loaded to context');
      }
    } catch (error) {
      console.error("Failed to load auth from storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthToStorage = async (user: User, tokens: Tokens) => {
    try {
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      await TokenService.storeTokens(tokens); // Use TokenService for better token management
      setUser(user);
      setTokens(tokens);
    } catch (error) {
      console.error("Failed to save auth to storage:", error);
      throw new Error("Failed to save authentication data");
    }
  };

  const clearAuthFromStorage = async () => {
    try {
      await TokenService.clearTokens(); // Use TokenService to clear all auth data
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error("Failed to clear auth from storage:", error);
    }
  };


  /**
   * Step 1: Register with basic info
   * Returns user_id for next steps
   */
  const register = async (
    user_name: string,
    pin: string,
    email: string
  ): Promise<{ user_id: number }> => {
    try {
      const response = await registerApi(user_name, pin, email);
      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }
      return { user_id: response.data!.user_id };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(message);
    }
  };

  /**
   * Step 2: Verify email with OTP
   */
  const verifyEmail = async (
    user_id: number,
    otp_code: string
  ): Promise<void> => {
    try {
      const response = await verifyEmailOTPApi(user_id, otp_code);
      if (!response.success) {
        throw new Error(response.message || "Verification failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Email verification failed";
      throw new Error(message);
    }
  };

  /**
   * Step 3: Set password and complete registration
   * Auto-login after successful password set
   */
  const setPassword = async (
    user_id: number,
    new_password: string
  ): Promise<void> => {
    try {
      const response = await setPasswordApi(user_id, new_password);
      if (!response.success) {
        throw new Error(response.message || "Failed to set password");
      }

      // Auto-login after successful registration
      const { user, tokens } = response.data!;
      await saveAuthToStorage(user, tokens);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to set password";
      throw new Error(message);
    }
  };

  // ========== LOGIN ==========>
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔄 Attempting login for:', email);
      const response = await loginApi(email, password);
      console.log('🔄 Login API response:', response);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const { user, tokens } = response.data!;
      console.log('🔄 Login successful, saving auth data...');
      await saveAuthToStorage(user, tokens);
      console.log('✅ Auth data saved successfully');
    } catch (error: any) {
      console.error('❌ Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const message = error.response?.data?.message || error.message || "Login failed";
      // Jika login gagal, pastikan tidak ada sisa data auth
      await clearAuthFromStorage();
      throw new Error(message);
    }
  };

  // ========== LOGOUT ==========>
  const logout = async (): Promise<void> => {
    await clearAuthFromStorage();
  };

  // ========== OWNER REGISTRATION FLOW ==========>

  /**
   * Step 1: Create tenant registration
   */
  const registerOwnerTenant = async (tenantData: TenantRegistrationData): Promise<{ registration_id: number; tenant_id: number }> => {
    try {
      const response = await registerTenantApi(tenantData);
      if (!response.success) {
        throw new Error(response.message || "Failed to create tenant registration");
      }
      return response.data!;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create tenant registration";
      throw new Error(message);
    }
  };

  /**
   * Step 2: Send email verification for owner
   */
  const sendOwnerEmailVerification = async (emailData: OwnerEmailData): Promise<any> => {
    try {
      const response = await sendOwnerVerificationEmailApi(emailData);
      if (!response.success) {
        throw new Error(response.message || "Failed to send email verification");
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to send email verification";
      throw new Error(message);
    }
  };

  /**
   * Step 3: Confirm email verification (shared for owner and employee)
   */
  const confirmEmailVerification = async (registration_id: number, otp_code: string): Promise<void> => {
    try {
      const response = await confirmEmailOtpApi(registration_id, otp_code);
      if (!response.success) {
        throw new Error(response.message || "Email verification failed");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Email verification failed";
      throw new Error(message);
    }
  };

  /**
   * Step 4: Complete owner registration
   */
  const completeOwnerRegistration = async (registration_id: number, password: string): Promise<void> => {
    try {
      const response = await completeOwnerRegistrationApi(registration_id, password);
      if (!response.success) {
        throw new Error(response.message || "Failed to complete registration");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to complete registration";
      throw new Error(message);
    }
  };

  // ========== EMPLOYEE REGISTRATION FLOW ==========>

  /**
   * Register employee with PIN
   */
  const registerEmployeeWithPin = async (employeeData: EmployeeRegistrationData): Promise<{ user_id: number }> => {
    try {
      const response = await registerEmployeeWithPinApi(employeeData);
      if (!response.success) {
        throw new Error(response.message || "Failed to register employee");
      }
      return response.data!;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to register employee";
      throw new Error(message);
    }
  };

  // ========== REFRESH PROFILE ==========>
  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await getProfileApi();
      if (response.success && response.data) {
        const updatedUser = response.data.user;
        await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      // Don't throw error - just log it
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated,
        login,
        register,
        verifyEmail,
        setPassword,
        registerOwnerTenant,
        sendOwnerEmailVerification,
        confirmEmailVerification,
        completeOwnerRegistration,
        registerEmployeeWithPin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========== HOOK ==========>
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};