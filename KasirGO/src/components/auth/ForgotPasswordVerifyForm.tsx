import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";
import { verifyForgotPasswordOTPApi, sendForgotPasswordOTPApi } from "../../api/auth";

const ForgotPasswordVerifyForm = () => {
    const { isLandscape: isLand, isTablet: isTab } = useOrientation();
    const params = useLocalSearchParams();
    const email = params.email as string;
    const [otpCode, setOtpCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { colors } = useTheme();

    const validateOTP = (): boolean => {
        if (!otpCode.trim()) {
            setError("Kode OTP tidak boleh kosong");
            return false;
        }
        if (otpCode.length !== 6) {
            setError("Kode OTP harus 6 digit");
            return false;
        }
        return true;
    };

    const handleVerifyOTP = async () => {
        if (!validateOTP()) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            await verifyForgotPasswordOTPApi(email, otpCode);
            router.push({
                pathname: "/auth/forgot-password/reset",
                params: { email, otpCode },
            });
        } catch (error: any) {
            setError(error.message || "Kode OTP tidak valid. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setIsResending(true);
            setError("");
            await sendForgotPasswordOTPApi(email);
            setOtpCode("");
        } catch (error: any) {
            setError(error.message || "Gagal mengirim ulang kode OTP.");
        } finally {
            setIsResending(false);
        }
    };

    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        input: {
            color: colors.text,
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
        link: {
            color: colors.primary,
        },
    });

    const shouldUseLargerStyles = isTab && isLand;

    return (
        <View style={[styles.container, shouldUseLargerStyles && styles.landscapeContainer, dynamicStyles.container]}>
            <Image
                source={require("../../../assets/images/KasirGOTrnsprt.png")}
                style={[styles.logo, shouldUseLargerStyles && styles.landscapeLogo]}
            />
            <Text style={[styles.title, shouldUseLargerStyles && styles.landscapeTitle, dynamicStyles.title]}>VERIFIKASI OTP</Text>
            <Text style={[styles.subtitle, shouldUseLargerStyles && styles.landscapeSubtitle, dynamicStyles.subtitle]}>
                Masukkan kode OTP yang telah dikirim ke {email}
            </Text>

            <View style={styles.fieldContainer}>
                <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Kode OTP</Text>
                <View style={[styles.inputWrapper, shouldUseLargerStyles && styles.landscapeInputWrapper, { borderColor: error ? '#ef4444' : colors.border }]}>
                    <TextInput
                        style={[styles.input, shouldUseLargerStyles && styles.landscapeInput, dynamicStyles.input]}
                        placeholder="000000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        value={otpCode}
                        onChangeText={(text) => {
                            setOtpCode(text);
                            if (error) setError("");
                        }}
                        maxLength={6}
                    />
                </View>
                {error && (
                    <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{error}</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, shouldUseLargerStyles && styles.landscapeButton, dynamicStyles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={shouldUseLargerStyles ? "large" : "small"} color="white" />
                ) : (
                    <Text style={[styles.buttonText, shouldUseLargerStyles && styles.landscapeButtonText]}>VERIFIKASI</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                <Text style={[styles.link, shouldUseLargerStyles && styles.landscapeLink, dynamicStyles.link]}>
                    {isResending ? "Mengirim ulang..." : "Kirim Ulang OTP"}
                </Text>
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
    inputWrapper: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
    },
    landscapeInputWrapper: {
        borderRadius: 12,
    },
    input: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        textAlign: "center",
        fontSize: 24,
        letterSpacing: 8,
    },
    landscapeInput: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 28,
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
    link: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        textDecorationLine: 'underline',
    },
    landscapeLink: {
        marginTop: 14,
        fontSize: 16,
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

export default ForgotPasswordVerifyForm;
