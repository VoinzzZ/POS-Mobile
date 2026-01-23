import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";
import { resetPasswordApi } from "../../api/auth";

const ForgotPasswordResetForm = () => {
    const { isLandscape: isLand, isTablet: isTab } = useOrientation();
    const params = useLocalSearchParams();
    const email = params.email as string;
    const otpCode = params.otpCode as string;
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        newPassword?: string;
        confirmPassword?: string;
    }>({});
    const router = useRouter();
    const { colors } = useTheme();

    const validatePasswords = (): boolean => {
        const newErrors: typeof errors = {};

        if (!newPassword.trim()) {
            newErrors.newPassword = "Password tidak boleh kosong";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password minimal 8 karakter";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Konfirmasi password tidak boleh kosong";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Password dan konfirmasi password tidak sama";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validatePasswords()) {
            return;
        }

        try {
            setIsLoading(true);
            await resetPasswordApi(email, otpCode, newPassword, confirmPassword);
            router.replace("/auth/login");
        } catch (error: any) {
            if (error.message?.includes("OTP")) {
                setErrors({ newPassword: error.message });
            } else {
                setErrors({ newPassword: error.message || "Gagal mereset password. Silakan coba lagi." });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        label: {
            color: colors.text,
        },
        title: {
            color: colors.text,
        },
        subtitle: {
            color: colors.textSecondary,
        },
        button: {
            backgroundColor: colors.primary,
        },
        buttonDisabled: {
            backgroundColor: colors.disabled,
        },
    });

    const shouldUseLargerStyles = isTab && isLand;

    return (
        <View style={[styles.container, shouldUseLargerStyles && styles.landscapeContainer, dynamicStyles.container]}>
            <Image
                source={require("../../../assets/images/KasirGOTrnsprt.png")}
                style={[styles.logo, shouldUseLargerStyles && styles.landscapeLogo]}
            />
            <Text style={[styles.title, shouldUseLargerStyles && styles.landscapeTitle, dynamicStyles.title]}>RESET PASSWORD</Text>
            <Text style={[styles.subtitle, shouldUseLargerStyles && styles.landscapeSubtitle, dynamicStyles.subtitle]}>
                Masukkan password baru untuk akun {email}
            </Text>

            <View style={styles.fieldContainer}>
                <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Password Baru</Text>
                <PasswordInput
                    value={newPassword}
                    onChangeText={(text) => {
                        setNewPassword(text);
                        if (errors.newPassword) {
                            setErrors({ ...errors, newPassword: undefined });
                        }
                    }}
                    placeholder="Masukkan password baru"
                    hasError={!!errors.newPassword}
                />
                {errors.newPassword && (
                    <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{errors.newPassword}</Text>
                )}
            </View>

            <View style={styles.fieldContainer}>
                <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Konfirmasi Password</Text>
                <PasswordInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) {
                            setErrors({ ...errors, confirmPassword: undefined });
                        }
                    }}
                    placeholder="Masukkan ulang password baru"
                    hasError={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                    <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{errors.confirmPassword}</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, shouldUseLargerStyles && styles.landscapeButton, dynamicStyles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={shouldUseLargerStyles ? "large" : "small"} color="white" />
                ) : (
                    <Text style={[styles.buttonText, shouldUseLargerStyles && styles.landscapeButtonText]}>RESET PASSWORD</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        maxWidth: 350,
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
    },
    landscapeContainer: {
        maxWidth: 500,
        padding: 32,
        gap: 16,
    },
    fieldContainer: {
        width: "100%",
        marginBottom: 4,
    },
    logo: {
        width: 200,
        height: 100,
        resizeMode: "contain",
        marginBottom: 10,
    },
    landscapeLogo: {
        width: 250,
        height: 125,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
    },
    landscapeTitle: {
        fontSize: 32,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: "center",
    },
    landscapeSubtitle: {
        fontSize: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        alignSelf: "flex-start",
    },
    landscapeLabel: {
        fontSize: 18,
        marginBottom: 10,
    },
    button: {
        width: "100%",
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    landscapeButton: {
        paddingVertical: 18,
        borderRadius: 12,
        marginTop: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
    },
    landscapeButtonText: {
        fontSize: 20,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    landscapeErrorText: {
        fontSize: 14,
        marginTop: 6,
        marginLeft: 4,
    },
});

export default ForgotPasswordResetForm;
