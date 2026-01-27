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
    LaptopMinimal,
    RotateCcw
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface CashierSidebarProps {
    currentRoute?: string;
}

export default function CashierSidebar({ currentRoute }: CashierSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useTheme();

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
            name: "Retur",
            icon: RotateCcw,
            route: "/(cashier)/returns",
            path: "/returns",
        },
        {
            name: "Settings",
            icon: Settings,
            route: "/(cashier)/settings",
            path: "/settings",
        },
    ];

    const isActive = (path: string) => pathname.includes(path);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            {/* Brand/Logo Section */}
            <View style={styles.brandSection}>
                <View style={[styles.brandIcon, { backgroundColor: colors.primary + "20" }]}>
                    <LaptopMinimal size={20} color={colors.primary} />
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
                            {active && (
                                <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
                            )}
                            <Icon
                                size={20}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        borderRightWidth: 1,
        paddingTop: 18,
        paddingBottom: 12,
        flexDirection: "column",
        flexShrink: 0,
    },
    brandSection: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        marginBottom: 12,
        marginHorizontal: 8,
    },
    brandIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    brandText: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    navSection: {
        flex: 1,
        paddingHorizontal: 6,
        gap: 6,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 10,
        gap: 3,
        position: "relative",
    },
    indicator: {
        position: "absolute",
        left: 0,
        width: 3,
        height: 34,
        borderRadius: 2,
    },
    navLabel: {
        fontSize: 9,
        textAlign: "center",
    },
});
