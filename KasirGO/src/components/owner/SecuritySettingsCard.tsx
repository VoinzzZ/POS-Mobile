import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { Lock, Eye, EyeOff, Shield, Key } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export default function SecuritySettingsCard() {
    const { colors } = useTheme();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Semua field harus diisi");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password baru minimal 6 karakter");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Password baru dan konfirmasi tidak cocok");
            return;
        }

        Alert.alert("Berhasil", "Password berhasil diubah");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Shield size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Keamanan Akun</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Key size={18} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Ubah Password</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password Saat Ini</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Masukkan password saat ini"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={styles.eyeButton}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff size={20} color={colors.textSecondary} />
                                ) : (
                                    <Eye size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password Baru</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Masukkan password baru"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.eyeButton}
                            >
                                {showNewPassword ? (
                                    <EyeOff size={20} color={colors.textSecondary} />
                                ) : (
                                    <Eye size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.hint, { color: colors.textSecondary }]}>
                            Minimal 6 karakter
                        </Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Konfirmasi Password Baru</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Konfirmasi password baru"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} color={colors.textSecondary} />
                                ) : (
                                    <Eye size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleChangePassword}
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    >
                        <Lock size={18} color="#ffffff" />
                        <Text style={styles.submitButtonText}>Ubah Password</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Tips Keamanan</Text>
                <View style={styles.tips}>
                    <Text style={[styles.tip, { color: colors.textSecondary }]}>• Gunakan password yang kuat dan unik</Text>
                    <Text style={[styles.tip, { color: colors.textSecondary }]}>• Jangan bagikan password ke siapapun</Text>
                    <Text style={[styles.tip, { color: colors.textSecondary }]}>• Ubah password secara berkala</Text>
                    <Text style={[styles.tip, { color: colors.textSecondary }]}>• Gunakan kombinasi huruf, angka, dan simbol</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    form: {
        gap: 16,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
    },
    passwordInputContainer: {
        position: "relative",
    },
    input: {
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingRight: 48,
        borderRadius: 8,
        borderWidth: 1,
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 12,
        padding: 4,
    },
    hint: {
        fontSize: 12,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
        marginTop: 8,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    tips: {
        gap: 8,
    },
    tip: {
        fontSize: 13,
        lineHeight: 20,
    },
});
