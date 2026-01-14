import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import { Bell, Mail, Smartphone, DollarSign, Package, BarChart3 } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

type NotificationSettings = {
    emailNotifications: boolean;
    pushNotifications: boolean;
    transactionAlerts: boolean;
    lowStockAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
};

export default function NotificationSettingsCard() {
    const { colors } = useTheme();
    const [settings, setSettings] = useState<NotificationSettings>({
        emailNotifications: true,
        pushNotifications: true,
        transactionAlerts: true,
        lowStockAlerts: true,
        dailyReports: false,
        weeklyReports: true,
    });

    const toggleSetting = (key: keyof NotificationSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderSettingItem = (
        icon: any,
        title: string,
        description: string,
        settingKey: keyof NotificationSettings,
        iconColor: string
    ) => {
        const Icon = icon;
        return (
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                        <Icon size={20} color={iconColor} />
                    </View>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                            {description}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={settings[settingKey]}
                    onValueChange={() => toggleSetting(settingKey)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                />
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Bell size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Preferensi Notifikasi</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Saluran Notifikasi</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {renderSettingItem(
                        Mail,
                        "Notifikasi Email",
                        "Terima notifikasi melalui email",
                        "emailNotifications",
                        "#3b82f6"
                    )}
                    {renderSettingItem(
                        Smartphone,
                        "Push Notification",
                        "Terima notifikasi push di perangkat",
                        "pushNotifications",
                        "#8b5cf6"
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Jenis Notifikasi</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {renderSettingItem(
                        DollarSign,
                        "Alert Transaksi",
                        "Notifikasi untuk setiap transaksi baru",
                        "transactionAlerts",
                        "#10b981"
                    )}
                    {renderSettingItem(
                        Package,
                        "Alert Stok Rendah",
                        "Peringatan ketika stok produk menipis",
                        "lowStockAlerts",
                        "#f59e0b"
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Laporan Berkala</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {renderSettingItem(
                        BarChart3,
                        "Laporan Harian",
                        "Ringkasan penjualan dan performa harian",
                        "dailyReports",
                        "#ec4899"
                    )}
                    {renderSettingItem(
                        BarChart3,
                        "Laporan Mingguan",
                        "Ringkasan penjualan dan performa mingguan",
                        "weeklyReports",
                        "#06b6d4"
                    )}
                </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Pengaturan notifikasi akan disimpan secara otomatis. Anda dapat mengubahnya kapan saja.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    card: {
        borderRadius: 12,
        overflow: "hidden",
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
    },
});
