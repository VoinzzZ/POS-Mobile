import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggleCard() {
    const { theme, toggleTheme, colors } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.left}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                    {theme === "dark" ? <Moon size={24} color={colors.primary} /> : <Sun size={24} color={colors.primary} />}
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>Mode Tema</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {theme === "dark" ? "Mode Gelap" : "Mode Terang"}
                    </Text>
                </View>
            </View>
            <Switch value={theme === "dark"} onValueChange={toggleTheme} trackColor={{ false: "#cbd5e1", true: colors.primary }} thumbColor={"#ffffff"} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        gap: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 13,
    },
});
