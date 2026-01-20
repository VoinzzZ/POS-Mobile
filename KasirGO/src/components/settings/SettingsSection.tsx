import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface SettingsOption {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    onPress: () => void;
}

interface SettingsSectionProps {
    title?: string;
    options: SettingsOption[];
}

export default function SettingsSection({ title, options }: SettingsSectionProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            {title && <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>}
            <View style={styles.optionsContainer}>
                {options.map((option, index) => {
                    const Icon = option.icon;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                { backgroundColor: colors.card },
                                index !== options.length - 1 && styles.optionBorder,
                                { borderBottomColor: colors.border },
                            ]}
                            onPress={option.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                                    <Icon size={22} color={colors.primary} />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    optionsContainer: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 18,
    },
    optionBorder: {
        borderBottomWidth: 1,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
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
        flex: 1,
        gap: 2,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    optionSubtitle: {
        fontSize: 13,
    },
});
