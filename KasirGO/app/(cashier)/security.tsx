import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft, Mail, Lock, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import ChangePasswordModal from "../../src/components/owner/ChangePasswordModal";
import ChangeEmailModal from "../../src/components/owner/ChangeEmailModal";

export default function SecurityScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

    const securityOptions = [
        {
            icon: Mail,
            title: "Ganti Email",
            subtitle: "Ubah alamat email akun Anda",
            onPress: () => setIsEmailModalVisible(true),
        },
        {
            icon: Lock,
            title: "Ganti Password",
            subtitle: "Perbarui password untuk keamanan akun",
            onPress: () => setIsPasswordModalVisible(true),
        },
    ];

    const renderContent = () => (
        <>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Keamanan</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.descriptionContainer}>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Kelola pengaturan keamanan akun Anda. Pastikan untuk menggunakan email dan password yang aman.
                    </Text>
                </View>

                <View style={styles.section}>
                    {securityOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.option, { backgroundColor: colors.card }]}
                                onPress={option.onPress}
                            >
                                <View style={styles.optionLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                                        <Icon size={20} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                                        <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.infoContainer}>
                    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.infoTitle, { color: colors.text }]}>Tips Keamanan</Text>
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            • Gunakan password minimal 8 karakter{"\n"}
                            • Jangan bagikan password Anda kepada siapapun{"\n"}
                            • Perbarui password secara berkala{"\n"}
                            • Gunakan kombinasi huruf, angka, dan simbol
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.landscapeMaster}>
                <CashierSidebar />
                <View style={styles.landscapeContent}>{renderContent()}</View>
            </View>

            <ChangeEmailModal
                visible={isEmailModalVisible}
                onClose={() => setIsEmailModalVisible(false)}
            />

            <ChangePasswordModal
                visible={isPasswordModalVisible}
                onClose={() => setIsPasswordModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    landscapeMaster: {
        flex: 1,
        flexDirection: "row",
    },
    landscapeContent: {
        flex: 1,
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    descriptionContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    optionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    infoContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
    },
});
