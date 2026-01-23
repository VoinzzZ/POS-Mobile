import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";
import { sendForgotPasswordOTPApi } from "../../api/auth";

const ForgotPasswordEmailForm = () => {
    const { isLandscape: isLand, isTablet: isTab } = useOrientation();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { colors } = useTheme();

    const validateEmail = (): boolean => {
        if (!email.trim()) {
            setError("Email tidak boleh kosong");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Format email tidak valid");
            return false;
        }
        return true;
    };

    const handleSendOTP = async () => {
        if (!validateEmail()) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            await sendForgotPasswordOTPApi(email);
            router.push({
                pathname: "/auth/forgot-password/verify",
                params: { email },
            });
        } catch (error: any) {
            setError(error.message || "Gagal mengirim kode OTP. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
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
            <Text style={[styles.title, shouldUseLargerStyles && styles.landscapeTitle, dynamicStyles.title]}>LUPA PASSWORD</Text>
            <Text style={[styles.subtitle, shouldUseLargerStyles && styles.landscapeSubtitle, dynamicStyles.subtitle]}>
                Masukkan email Anda untuk menerima kode verifikasi
            </Text>

            <View style={styles.fieldContainer}>
                <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Email</Text>
                <View style={[styles.inputWrapper, shouldUseLargerStyles && styles.landscapeInputWrapper, { borderColor: error ? '#ef4444' : colors.border }]}>
                    <TextInput
                        style={[styles.input, shouldUseLargerStyles && styles.landscapeInput, dynamicStyles.input]}
                        placeholder="contoh@email.com"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (error) setError("");
                        }}
                        autoCapitalize="none"
                    />
                </View>
                {error && (
                    <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{error}</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, shouldUseLargerStyles && styles.landscapeButton, dynamicStyles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size={shouldUseLargerStyles ? "large" : "small"} color="white" />
                ) : (
                    <Text style={[styles.buttonText, shouldUseLargerStyles && styles.landscapeButtonText]}>KIRIM OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.link, shouldUseLargerStyles && styles.landscapeLink, dynamicStyles.link]}>Kembali ke Login</Text>
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
    },
    landscapeInput: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
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

export default ForgotPasswordEmailForm;
