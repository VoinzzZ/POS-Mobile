import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from "react-native";
import { ArrowLeft, Check } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { changePasswordApi } from "../../api/auth";
import SlideModal from "../cashier/modals/SlideModal";

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    visible,
    onClose,
}) => {
    const { colors } = useTheme();
    const { logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});

    useEffect(() => {
        if (visible) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
        }
    }, [visible]);

    const validatePassword = (pass: string): boolean => {
        const minLength = pass.length >= 6;
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);

        return minLength && hasUpperCase && hasLowerCase && hasNumber;
    };

    const passwordRequirements = [
        { label: 'Minimal 6 karakter', test: (pass: string) => pass.length >= 6 },
        { label: 'Mengandung huruf besar', test: (pass: string) => /[A-Z]/.test(pass) },
        { label: 'Mengandung huruf kecil', test: (pass: string) => /[a-z]/.test(pass) },
        { label: 'Mengandung angka', test: (pass: string) => /[0-9]/.test(pass) },
    ];

    const isPasswordValid = validatePassword(newPassword);
    const isPasswordMatch = newPassword === confirmPassword && newPassword !== '';

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = "Password saat ini wajib diisi";
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = "Password baru wajib diisi";
        } else if (!isPasswordValid) {
            newErrors.newPassword = "Password tidak memenuhi persyaratan";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Konfirmasi password wajib diisi";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Password tidak sama";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await changePasswordApi(
                currentPassword,
                newPassword,
                confirmPassword
            );

            if (response.success) {
                Alert.alert(
                    "Berhasil",
                    "Password berhasil diubah. Silakan login kembali.",
                    [
                        {
                            text: "OK",
                            onPress: async () => {
                                onClose();
                                await logout();
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Gagal mengubah password";
            if (errorMsg.toLowerCase().includes("password") && errorMsg.toLowerCase().includes("salah")) {
                setErrors({ currentPassword: errorMsg });
            } else {
                setErrors({ newPassword: errorMsg });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SlideModal visible={visible} onClose={onClose} backgroundColor={colors.background}>
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Ganti Password</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Password Saat Ini *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: errors.currentPassword ? "#ef4444" : colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Masukkan password saat ini"
                            placeholderTextColor={colors.textSecondary}
                            value={currentPassword}
                            onChangeText={(text) => {
                                setCurrentPassword(text);
                                if (errors.currentPassword) {
                                    setErrors({ ...errors, currentPassword: undefined });
                                }
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.currentPassword && (
                            <Text style={styles.errorText}>{errors.currentPassword}</Text>
                        )}
                    </View>

                    <View style={styles.requirementsContainer}>
                        <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                            Persyaratan Password Baru:
                        </Text>
                        {passwordRequirements.map((requirement, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <View style={[
                                    styles.requirementIcon,
                                    { backgroundColor: requirement.test(newPassword) ? colors.success + '20' : colors.border }
                                ]}>
                                    <Check
                                        size={12}
                                        color={requirement.test(newPassword) ? colors.success : colors.textSecondary}
                                    />
                                </View>
                                <Text style={[
                                    styles.requirementText,
                                    {
                                        color: requirement.test(newPassword) ? colors.success : colors.textSecondary,
                                        fontWeight: requirement.test(newPassword) ? '600' : '400'
                                    }
                                ]}>
                                    {requirement.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Password Baru *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: isPasswordValid && newPassword ? colors.success : (errors.newPassword ? "#ef4444" : colors.border),
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Masukkan password baru"
                            placeholderTextColor={colors.textSecondary}
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                if (errors.newPassword) {
                                    setErrors({ ...errors, newPassword: undefined });
                                }
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.newPassword && (
                            <Text style={styles.errorText}>{errors.newPassword}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Konfirmasi Password Baru *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: isPasswordMatch ? colors.success : (errors.confirmPassword ? "#ef4444" : colors.border),
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Masukkan ulang password baru"
                            placeholderTextColor={colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors({ ...errors, confirmPassword: undefined });
                                }
                            }}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                        {confirmPassword && !errors.confirmPassword && isPasswordMatch && (
                            <Text style={[styles.successText, { color: colors.success }]}>Password cocok</Text>
                        )}
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Setelah password diubah, Anda akan keluar dari aplikasi dan perlu login kembali dengan password baru.
                        </Text>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[
                            styles.button,
                            styles.fullWidthButton,
                            { backgroundColor: colors.primary },
                        ]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveText}>Simpan Perubahan</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SlideModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
        position: "absolute",
        left: 20,
        top: 64,
        zIndex: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 32,
    },
    body: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 4,
    },
    successText: {
        color: "#22c55e",
        fontSize: 12,
        marginTop: 4,
    },
    requirementsContainer: {
        marginBottom: 20,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    requirementIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    requirementText: {
        fontSize: 13,
        flex: 1,
    },
    infoCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 18,
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
        gap: 12,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#334155",
    },
    cancelText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 2,
    },
    fullWidthButton: {
        width: "100%",
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default ChangePasswordModal;
