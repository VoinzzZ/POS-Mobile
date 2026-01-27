import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
    initializeNotifications,
    scheduleLowStockCheck,
    checkLowStockAndNotify,
    setupNotificationResponse,
    registerPushTokenWithBackend
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

export const useNotifications = () => {
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || user.user_role !== "admin") {
            return;
        }

        const initNotifications = async () => {
            const status = await initializeNotifications();
            setPermissionStatus(status);

            if (status === "granted") {
                await registerPushTokenWithBackend();
                await scheduleLowStockCheck();
                await checkLowStockAndNotify();

                const interval = setInterval(checkLowStockAndNotify, 6 * 60 * 60 * 1000);

                return () => clearInterval(interval);
            }
        };

        initNotifications();

        const subscription = setupNotificationResponse((response) => {
            const data = response.notification.request.content.data;

            if (data.type === "low-stock") {
                router.push("/(admin)");
            }
        });

        return () => {
            subscription.remove();
        };
    }, [user]);

    return { permissionStatus };
};

