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
} from "../api/auth";
import TokenService from "../services/tokenService";

// ========== TYPES ==========
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

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    user_name: string,
    pin: string,
    email: string
  ) => Promise<{ user_id: number }>;
  verifyEmail: (user_id: number, otp_code: string) => Promise<void>;
  setPassword: (user_id: number, new_password: string) => Promise<void>;
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
      const userStr = await AsyncStorage.getItem("@user");
      const tokenStr = await AsyncStorage.getItem("@tokens");

      if (userStr) setUser(JSON.parse(userStr));
      if (tokenStr) setTokens(JSON.parse(tokenStr));
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
      const response = await loginApi(email, password);
      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const { user, tokens } = response.data!;
      await saveAuthToStorage(user, tokens);
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(message);
    }
  };

  // ========== LOGOUT ==========>
  const logout = async (): Promise<void> => {
    await clearAuthFromStorage();
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