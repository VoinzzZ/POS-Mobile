import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tokens: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const userStr = await AsyncStorage.getItem("@user");
        const tokenStr = await AsyncStorage.getItem("@tokens");
        if (userStr) setUser(JSON.parse(userStr));
        if (tokenStr) setTokens(JSON.parse(tokenStr));
      } catch (e) {
        console.log("Failed to load auth from storage", e);
      }
    };
    loadStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("http://localhost:3000/api/v1/auth/login", {
        email,
        password,
      });
      if (res.data.success) {
        const { user, tokens } = res.data.data;
        setUser(user);
        setTokens(tokens);

        await AsyncStorage.setItem("@user", JSON.stringify(user));
        await AsyncStorage.setItem("@tokens", JSON.stringify(tokens));
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const logout = async () => {
    setUser(null);
    setTokens(null);
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@tokens");
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
