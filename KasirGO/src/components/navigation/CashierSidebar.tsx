import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
    LayoutDashboard,
    ShoppingCart,
    History,
    Package,
    BarChart3,
    Settings,
    LogOut,
    User,
    LaptopMinimal
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface CashierSidebarProps {
    currentRoute?: string;
}

export default function CashierSidebar({ currentRoute }: CashierSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useTheme();
    const { user, logout } = useAuth();

    const tabs = [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            route: "/(cashier)/dashboard",
            path: "/dashboard",
        },
        {
            name: "Workspace",
            icon: ShoppingCart,
            route: "/(cashier)/workspace",
            path: "/workspace",
        },
        {
            name: "Product",
            icon: Package,
            route: "/(cashier)/product",
            path: "/product",
        },
        {
            name: "History",
            icon: History,
            route: "/(cashier)/history",
            path: "/history",
        },
        {
            name: "Settings",
            icon: Settings,
            route: "/(cashier)/settings",
            path: "/settings",
        },
    ];

    const isActive = (path: string) => pathname.includes(path);

    const handleLogout = async () => {
        await logout();
        router.replace("/(auth)/login" as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            {/* Brand/Logo Section */}
            <View style={styles.brandSection}>
                <View style={[styles.brandIcon, { backgroundColor: colors.primary + "20" }]}>
                    <LaptopMinimal size={24} color={colors.primary} />
                </View>
                <Text style={[styles.brandText, { color: colors.text }]}>POS</Text>
            </View>

            {/* Navigation Items */}
            <View style={styles.navSection}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={[
                                styles.navItem,
                                active && { backgroundColor: colors.primary + "15" }
                            ]}
                            onPress={() => router.push(tab.route as any)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                size={24}
                                color={active ? colors.primary : colors.textSecondary}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <Text
                                style={[
                                    styles.navLabel,
                                    {
                                        color: active ? colors.primary : colors.textSecondary,
                                        fontWeight: active ? "600" : "500"
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* User Section */}
            <View style={styles.userSection}>
                <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                    <User size={20} color={colors.primary} />
                </View>
                <Text
                    style={[styles.userName, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {user?.user_name || "Cashier"}
                </Text>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.error + "15" }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <LogOut size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 90,
        borderRightWidth: 1,
        paddingTop: 24,
        paddingBottom: 16,
        flexDirection: "column",
    },
    brandSection: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        marginBottom: 16,
        marginHorizontal: 12,
    },
    brandIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    brandText: {
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    navSection: {
        flex: 1,
        paddingHorizontal: 8,
        gap: 8,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 4,
    },
    navLabel: {
        fontSize: 11,
        textAlign: "center",
    },
    userSection: {
        alignItems: "center",
        paddingTop: 16,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        marginTop: 16,
        gap: 8,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    userName: {
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center",
    },
    logoutButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 4,
    },
});
