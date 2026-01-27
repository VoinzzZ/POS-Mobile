import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { useTheme } from "../../context/ThemeContext";
import { getLowStockNotifications } from "../../api/notification";
import { checkLowStockAndNotify } from "../../services/notificationService";
import NotificationModal from "./NotificationModal";

export default function NotificationIcon() {
    const { colors } = useTheme();
    const [count, setCount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const response = await getLowStockNotifications();
            if (response.success && response.data) {
                setCount(response.data.length);
            } else {
                setCount(0);
            }
        } catch (error: any) {
            console.error("Error fetching notification count:", error?.message || error);
            setCount(0);
        }
    };

    const handlePress = async () => {
        setModalVisible(true);
        await Notifications.setBadgeCountAsync(0);
        await checkLowStockAndNotify();
        fetchNotificationCount();
    };

    const handleModalClose = () => {
        setModalVisible(false);
        fetchNotificationCount();
    };

    return (
        <>
            <TouchableOpacity onPress={handlePress} style={styles.container}>
                <Bell size={24} color={colors.textSecondary} />
                {count > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {count > 99 ? "99+" : count}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
            <NotificationModal visible={modalVisible} onClose={handleModalClose} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "#ef4444",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "#ffffff",
        fontSize: 10,
        fontWeight: "700",
    },
});
