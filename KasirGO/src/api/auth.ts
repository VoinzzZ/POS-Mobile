import axios from "axios";
import { API_URL } from "@env";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      userId: number;
      userName: string;
      email: string;
      role: string;
      isVerified: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      refreshExpiresIn: number;
    };
  };
}

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};
