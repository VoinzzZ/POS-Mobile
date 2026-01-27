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
import { X, ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { sendEmailChangeOTPApi, verifyEmailChangeOTPApi, verifyCurrentPasswordApi } from "../../api/auth";
import { useRouter } from "expo-router";
import SlideModal from "../cashier/modals/SlideModal";

interface ChangeEmailModalProps {
    visible: boolean;
    onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
    visible,
    onClose,
}) => {
    const { colors } = useTheme();
    const { user, logout } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [otpTimer, setOtpTimer] = useState(600);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        currentPassword?: string;
        newEmail?: string;
        confirmEmail?: string;
        otpCode?: string;
    }>({});

    useEffect(() => {
        if (visible) {
            setStep(1);
            setCurrentPassword("");
            setNewEmail("");
            setConfirmEmail("");
            setOtpCode("");
            setOtpTimer(600);
            setErrors({});
        }
    }, [visible]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 3 && otpTimer > 0) {
            timer = setInterval(() => {
                setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, otpTimer]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateStep1 = () => {
        const newErrors: typeof errors = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = "Password saat ini wajib diisi";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVerifyPassword = async () => {
        if (!validateStep1()) {
            return;
        }

        setLoading(true);
        try {
            await verifyCurrentPasswordApi(currentPassword);
            setStep(2);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Password saat ini salah";
            setErrors({ currentPassword: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const validateStep2 = () => {
        const newErrors: typeof errors = {};

        if (!newEmail.trim()) {
            newErrors.newEmail = "Email baru wajib diisi";
        } else if (!validateEmail(newEmail)) {
            newErrors.newEmail = "Format email tidak valid";
        } else if (newEmail === user?.user_email) {
            newErrors.newEmail = "Email baru sama dengan email saat ini";
        }

        if (!confirmEmail.trim()) {
            newErrors.confirmEmail = "Konfirmasi email wajib diisi";
        } else if (newEmail !== confirmEmail) {
            newErrors.confirmEmail = "Email tidak sama";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async () => {
        if (!validateStep2()) {
            return;
        }

        setLoading(true);
        try {
            const response = await sendEmailChangeOTPApi({
                newEmail: newEmail.trim(),
                currentPassword,
            });

            if (response.success) {
                setStep(3);
                setOtpTimer(600);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Gagal mengirim kode OTP";
            setErrors({ newEmail: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (otpTimer > 0) {
            return;
        }

        setLoading(true);
        try {
            const response = await sendEmailChangeOTPApi({
                newEmail: newEmail.trim(),
                currentPassword,
            });

            if (response.success) {
                setOtpTimer(600);
                setOtpCode("");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Gagal mengirim ulang kode OTP";
            setErrors({ otpCode: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const validateStep3 = () => {
        const newErrors: typeof errors = {};

        if (!otpCode.trim()) {
            newErrors.otpCode = "Kode OTP wajib diisi";
        } else if (otpCode.trim().length !== 6) {
            newErrors.otpCode = "Kode OTP harus 6 digit";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVerifyOTP = async () => {
        if (!validateStep3()) {
            return;
        }

        setLoading(true);
        try {
            const response = await verifyEmailChangeOTPApi(otpCode.trim());

            if (response.success) {
                Alert.alert(
                    "Berhasil",
                    "Email berhasil diubah. Silakan login kembali dengan email baru Anda.",
                    [
                        {
                            text: "OK",
                            onPress: async () => {
                                onClose();
                                await logout();
                                router.replace("/auth/login");
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Kode OTP salah atau sudah kadaluarsa";
            setErrors({ otpCode: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setErrors({});
        } else if (step === 3) {
            setStep(2);
            setOtpCode("");
            setErrors({});
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1:
                return "Verifikasi Password";
            case 2:
                return "Email Baru";
            case 3:
                return "Verifikasi OTP";
            default:
                return "Ganti Email";
        }
    };

    const getButtonText = () => {
        switch (step) {
            case 1:
                return "Lanjutkan";
            case 2:
                return "Kirim Kode OTP";
            case 3:
                return "Verifikasi & Ubah Email";
            default:
                return "Lanjutkan";
        }
    };

    const handleSubmit = () => {
        switch (step) {
            case 1:
                handleVerifyPassword();
                break;
            case 2:
                handleSendOTP();
                break;
            case 3:
                handleVerifyOTP();
                break;
        }
    };

    return (
        <SlideModal visible={visible} onClose={onClose} backgroundColor={colors.background}>
            <View style={styles.container}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    {step === 1 ? (
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    <Text style={[styles.title, { color: colors.text }]}>
                        {getStepTitle()}
                    </Text>
                    {step === 3 && (
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    {(step === 1 || step === 2) && <View style={styles.headerSpacer} />}
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicatorContainer}>
                    <View style={styles.stepIndicator}>
                        {[1, 2, 3].map((s) => (
                            <View key={s} style={styles.stepItem}>
                                <View
                                    style={[
                                        styles.stepCircle,
                                        {
                                            backgroundColor: step >= s ? colors.primary : colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.stepNumber,
                                            { color: step >= s ? "#fff" : colors.textSecondary },
                                        ]}
                                    >
                                        {s}
                                    </Text>
                                </View>
                                {s < 3 && (
                                    <View
                                        style={[
                                            styles.stepLine,
                                            {
                                                backgroundColor: step > s ? colors.primary : colors.border,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
                    {step === 1 && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Email Saat Ini</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.border,
                                            borderColor: colors.border,
                                            color: colors.textSecondary,
                                        },
                                    ]}
                                    value={user?.user_email}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Password Saat Ini *
                                </Text>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.passwordInput,
                                            {
                                                backgroundColor: colors.card,
                                                borderColor: errors.currentPassword ? "#ef4444" : colors.border,
                                                color: colors.text,
                                            },
                                        ]}
                                        placeholder="Masukkan password Anda"
                                        placeholderTextColor={colors.textSecondary}
                                        value={currentPassword}
                                        onChangeText={(text) => {
                                            setCurrentPassword(text);
                                            if (errors.currentPassword) {
                                                setErrors({ ...errors, currentPassword: undefined });
                                            }
                                        }}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} color={colors.textSecondary} />
                                        ) : (
                                            <Eye size={20} color={colors.textSecondary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.currentPassword && (
                                    <Text style={styles.errorText}>{errors.currentPassword}</Text>
                                )}
                            </View>

                            <View
                                style={[
                                    styles.infoCard,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Verifikasi password Anda terlebih dahulu untuk keamanan.
                                </Text>
                            </View>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Email Baru *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: errors.newEmail ? "#ef4444" : colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Masukkan email baru"
                                    placeholderTextColor={colors.textSecondary}
                                    value={newEmail}
                                    onChangeText={(text) => {
                                        setNewEmail(text.trim());
                                        if (errors.newEmail) {
                                            setErrors({ ...errors, newEmail: undefined });
                                        }
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.newEmail && (
                                    <Text style={styles.errorText}>{errors.newEmail}</Text>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Konfirmasi Email Baru *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: errors.confirmEmail ? "#ef4444" : colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Masukkan ulang email baru"
                                    placeholderTextColor={colors.textSecondary}
                                    value={confirmEmail}
                                    onChangeText={(text) => {
                                        setConfirmEmail(text.trim());
                                        if (errors.confirmEmail) {
                                            setErrors({ ...errors, confirmEmail: undefined });
                                        }
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.confirmEmail && (
                                    <Text style={styles.errorText}>{errors.confirmEmail}</Text>
                                )}
                            </View>

                            <View
                                style={[
                                    styles.infoCard,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Kode OTP akan dikirim ke email baru Anda untuk verifikasi.
                                </Text>
                            </View>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <View
                                style={[
                                    styles.infoCard,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.infoTitle, { color: colors.text }]}>
                                    Kode OTP telah dikirim ke:
                                </Text>
                                <Text style={[styles.infoEmail, { color: colors.primary }]}>
                                    {newEmail}
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Kode OTP (6 digit) *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.otpInput,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: errors.otpCode ? "#ef4444" : colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="000000"
                                    placeholderTextColor={colors.textSecondary}
                                    value={otpCode}
                                    onChangeText={(text) => {
                                        const numericText = text.replace(/[^0-9]/g, "");
                                        if (numericText.length <= 6) {
                                            setOtpCode(numericText);
                                            if (errors.otpCode) {
                                                setErrors({ ...errors, otpCode: undefined });
                                            }
                                        }
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                {errors.otpCode && (
                                    <Text style={styles.errorText}>{errors.otpCode}</Text>
                                )}
                            </View>

                            <View style={styles.otpTimerContainer}>
                                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                                    {otpTimer > 0
                                        ? `Kode berlaku selama ${formatTime(otpTimer)}`
                                        : "Kode sudah kadaluarsa"}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleResendOTP}
                                    disabled={otpTimer > 0 || loading}
                                    style={styles.resendButton}
                                >
                                    <Text
                                        style={[
                                            styles.resendText,
                                            {
                                                color: otpTimer > 0 ? colors.disabled : colors.primary,
                                            },
                                        ]}
                                    >
                                        {loading ? "Mengirim..." : "Kirim Ulang OTP"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View
                                style={[
                                    styles.infoCard,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                    Setelah verifikasi berhasil, Anda akan keluar dan perlu login dengan email baru.
                                </Text>
                            </View>
                        </>
                    )}
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    {(step === 1 || step === 2) ? (
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
                                <Text style={styles.saveText}>{getButtonText()}</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.button, styles.cancelButton]}
                                disabled={loading}
                            >
                                <Text style={styles.cancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                style={[
                                    styles.button,
                                    styles.saveButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveText}>{getButtonText()}</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
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
    closeButton: {
        padding: 4,
    },
    headerSpacer: {
        width: 32,
    },
    stepIndicatorContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    stepIndicator: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: "600",
    },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: 4,
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
    passwordInputContainer: {
        position: 'relative',
        width: '100%',
    },
    passwordInput: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 16,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        top: 15,
        padding: 4,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 4,
    },
    infoCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 18,
    },
    infoTitle: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    infoEmail: {
        fontSize: 16,
        fontWeight: '600',
    },
    otpInput: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 8,
    },
    otpTimerContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    timerText: {
        fontSize: 14,
        marginBottom: 8,
    },
    resendButton: {
        paddingVertical: 8,
    },
    resendText: {
        fontSize: 14,
        fontWeight: "600",
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

export default ChangeEmailModal;
