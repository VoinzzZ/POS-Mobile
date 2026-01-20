import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Clock } from "lucide-react-native";

export default function ProfileCard() {
    const { colors } = useTheme();
    const { user } = useAuth();

    console.log("🔍 ProfileCard - User data:", {
        user_name: user?.user_name,
        user_full_name: user?.user_full_name,
        user_email: user?.user_email,
        user_role: user?.user_role,
        user_phone: user?.user_phone,
        lastLogin: user?.lastLogin,
    });

    const getInitials = (name: string | undefined) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    const getUserDisplayName = () => {
        return user?.user_name || "User";
    };

    const getRoleBadgeColor = (role: string | undefined) => {
        switch (role?.toLowerCase()) {
            case "owner":
                return { bg: "#7c2d12", text: "#fb923c" };
            case "admin":
                return { bg: "#1e3a8a", text: "#60a5fa" };
            case "cashier":
                return { bg: "#064e3b", text: "#10b981" };
            default:
                return { bg: "#374151", text: "#9ca3af" };
        }
    };

    const roleColors = getRoleBadgeColor(user?.role);

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
                <View style={styles.mainInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.avatarText]}>{getInitials(getUserDisplayName())}</Text>
                    </View>
                    <View style={styles.basicInfo}>
                        <Text style={[styles.name, { color: colors.text }]}>{getUserDisplayName()}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}20` }]}>
                            <Text style={[styles.roleText, { color: colors.primary }]}>{user?.user_role || user?.role || "User"}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.detailsSection, { borderTopColor: colors.border }]}>
                {user?.user_email && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailContent}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{user.user_email}</Text>
                        </View>
                    </View>
                )}
                {user?.lastLogin && (
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                            <Clock size={20} color={colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Login Terakhir</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {new Date(user.lastLogin).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 20,
    },
    mainInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ffffff",
    },
    basicInfo: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    roleText: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    detailsSection: {
        borderTopWidth: 1,
        paddingTop: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: "600",
    },
});
