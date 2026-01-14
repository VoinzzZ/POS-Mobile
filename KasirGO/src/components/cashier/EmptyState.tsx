import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    actionText?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, subtitle, actionText, onAction }: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Icon size={48} color={colors.textSecondary} />
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            {actionText && onAction && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={onAction}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
    actionButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    actionText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
