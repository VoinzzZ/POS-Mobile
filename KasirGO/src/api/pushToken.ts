import api from "./axiosInstance";

export const registerPushToken = async (pushToken: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const res = await api.post("/notifications/register-token", { pushToken });
        return res.data;
    } catch (error: any) {
        console.error("Error registering push token:", error?.message || error);
        throw error;
    }
};
