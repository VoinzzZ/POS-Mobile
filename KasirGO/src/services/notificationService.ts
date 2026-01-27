import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLowStockNotifications, LowStockNotification } from "../api/notification";

const NOTIFICATION_CHANNEL_ID = "low-stock-alerts";
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;
const NOTIFIED_PRODUCTS_KEY = "@notified_low_stock_products";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const initializeNotifications = async () => {
    if (!Device.isDevice) {
        console.log("Notifications only work on physical devices");
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return null;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
            name: "Low Stock Alerts",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#ef4444",
        });
    }

    return finalStatus;
};

export const scheduleLowStockCheck = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Checking stock levels...",
            body: "This is a background check",
            data: { type: "low-stock-check" },
        },
        trigger: {
            seconds: 60,
            repeats: true,
        },
    });
};

const getNotifiedProducts = async (): Promise<Set<number>> => {
    try {
        const data = await AsyncStorage.getItem(NOTIFIED_PRODUCTS_KEY);
        return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
        return new Set();
    }
};

const saveNotifiedProducts = async (productIds: Set<number>) => {
    try {
        await AsyncStorage.setItem(NOTIFIED_PRODUCTS_KEY, JSON.stringify([...productIds]));
    } catch (error) {
        console.error("Failed to save notified products:", error);
    }
};

export const checkLowStockAndNotify = async () => {
    try {
        const response = await getLowStockNotifications();

        if (!response.success || !response.data || response.data.length === 0) {
            return;
        }

        const lowStockProducts = response.data;
        const notifiedProducts = await getNotifiedProducts();
        const newLowStockProducts: LowStockNotification[] = [];

        for (const product of lowStockProducts) {
            if (!notifiedProducts.has(product.product_id)) {
                newLowStockProducts.push(product);
                notifiedProducts.add(product.product_id);
            }
        }

        if (newLowStockProducts.length > 0) {
            await saveNotifiedProducts(notifiedProducts);
            await sendLowStockNotification(newLowStockProducts);
        }
    } catch (error) {
        console.error("Error checking low stock:", error);
    }
};

const sendLowStockNotification = async (products: LowStockNotification[]) => {
    const count = products.length;
    let body = "";

    if (count === 1) {
        const product = products[0];
        body = `${product.product_name} - Stok: ${product.product_qty}/${product.product_min_stock}`;
    } else {
        body = `${count} produk memiliki stok di bawah minimum`;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "⚠️ Peringatan Stok Rendah",
            body,
            data: {
                type: "low-stock",
                products: products.map(p => p.product_id),
                count
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
    });
};

export const clearNotifiedProduct = async (productId: number) => {
    const notifiedProducts = await getNotifiedProducts();
    notifiedProducts.delete(productId);
    await saveNotifiedProducts(notifiedProducts);
};

export const clearAllNotifiedProducts = async () => {
    await AsyncStorage.removeItem(NOTIFIED_PRODUCTS_KEY);
};

export const setupNotificationResponse = (callback: (response: Notifications.NotificationResponse) => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
};

export const getExpoPushToken = async (): Promise<string | null> => {
    try {
        if (!Device.isDevice) {
            console.log("Push notifications only work on physical devices");
            return null;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Push notification permission not granted");
            return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: "79341890-7417-4b3e-adee-da8447f321c8"
        });

        return tokenData.data;
    } catch (error) {
        console.error("Error getting Expo push token:", error);
        return null;
    }
};

export const registerPushTokenWithBackend = async (): Promise<boolean> => {
    try {
        const pushToken = await getExpoPushToken();

        if (!pushToken) {
            console.log("No push token available");
            return false;
        }

        const { registerPushToken } = await import("../api/pushToken");
        const response = await registerPushToken(pushToken);

        if (response.success) {
            console.log("Push token registered successfully with backend");
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error registering push token with backend:", error);
        return false;
    }
};

