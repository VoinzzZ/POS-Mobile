import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Eye, EyeOff, ArrowRight, Check, Info } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useOrientation } from '@/src/hooks/useOrientation';

interface EmployeePasswordSetupContentProps {
    colors: any;
    params: any;
    router: any;
}

export default function PasswordSetupContent({
    colors,
    params,
    router
}: EmployeePasswordSetupContentProps) {
    const { isLandscape: isLand } = useOrientation();
    const { completeEmployeeRegistration } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const isPasswordValid = validatePassword(password);
    const isPasswordMatch = password === confirmPassword && password !== '';

    const handleCompleteRegistration = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Silakan masukkan password dan konfirmasi password');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert('Error', 'Password tidak memenuhi syarat');
            return;
        }

        setLoading(true);
        try {
            const registrationId = params.registration_id || params.user_id;
            if (!registrationId) {
                throw new Error('Registration ID tidak ditemukan');
            }

            await completeEmployeeRegistration(registrationId, password);

            router.replace('/auth/register/employee/completion');
        } catch (error: any) {
            let errorMessage = 'Gagal menyelesaikan pendaftaran. Silakan coba lagi.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordForm = () => (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 18 : 16 }]}>
                    Password
                </Text>
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={[
                            styles.passwordInput,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                                fontSize: isLand ? 17 : 16,
                            }
                        ]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Masukkan password"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        maxLength={100}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff size={isLand ? 22 : 20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={isLand ? 22 : 20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 18 : 16 }]}>
                    Konfirmasi Password
                </Text>
                <View style={styles.passwordInputContainer}>
                    <TextInput
                        style={[
                            styles.passwordInput,
                            {
                                backgroundColor: colors.card,
                                borderColor: isPasswordMatch ? colors.success : colors.border,
                                color: colors.text,
                                fontSize: isLand ? 17 : 16,
                            }
                        ]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Konfirmasi password"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        maxLength={100}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={isLand ? 22 : 20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={isLand ? 22 : 20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
                {confirmPassword && !isPasswordMatch && (
                    <Text style={[styles.errorText, { color: colors.error, fontSize: isLand ? 15 : 14 }]}>
                        Password tidak cocok
                    </Text>
                )}
            </View>

            <TouchableOpacity
                style={[
                    styles.completeButton,
                    loading && styles.buttonDisabled,
                    {
                        backgroundColor: loading ? colors.disabled : colors.primary,
                        paddingVertical: isLand ? 16 : 16,
                    }
                ]}
                onPress={handleCompleteRegistration}
                disabled={loading}
            >
                <Text style={[styles.completeButtonText, { color: colors.background, fontSize: isLand ? 17 : 16 }]}>
                    {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
                </Text>
                <ArrowRight size={isLand ? 22 : 20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLand ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.landscapeRow}>
                        <View style={styles.leftColumn}>
                            <View style={styles.header}>
                                <View style={styles.headerContent}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                                        <Lock size={36} color={colors.secondary} />
                                    </View>
                                    <Text style={[styles.title, { color: colors.text, fontSize: 28 }]}>
                                        Buat Password
                                    </Text>
                                    <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 18 }]}>
                                        Buat password aman untuk akun Anda
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                                <View style={[styles.progressLine, { backgroundColor: colors.primary, width: 28 }]} />
                                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                                <View style={[styles.progressLine, { backgroundColor: colors.primary, width: 28 }]} />
                                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                                <View style={[styles.progressLine, { backgroundColor: colors.primary, width: 28 }]} />
                                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                            </View>

                            <View style={styles.requirementsContainer}>
                                <Text style={[styles.requirementsTitle, { color: colors.text, fontSize: 18 }]}>
                                    Persyaratan Password:
                                </Text>
                                {passwordRequirements.map((requirement, index) => (
                                    <View key={index} style={styles.requirementItem}>
                                        <View style={[
                                            styles.requirementIcon,
                                            { backgroundColor: requirement.test(password) ? colors.success + '20' : colors.border, width: 22, height: 22 }
                                        ]}>
                                            <Check
                                                size={14}
                                                color={requirement.test(password) ? colors.success : colors.textSecondary}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.requirementText,
                                            {
                                                color: requirement.test(password) ? colors.success : colors.textSecondary,
                                                fontFamily: requirement.test(password) ? 'Inter_500Medium' : 'Inter_400Regular',
                                                fontSize: 15,
                                            }
                                        ]}>
                                            {requirement.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.rightColumn}>
                            {renderPasswordForm()}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                                <Lock size={32} color={colors.secondary} />
                            </View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                Buat Password
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Buat password aman untuk akun Anda
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
                        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                    </View>

                    <View style={styles.requirementsContainer}>
                        <Text style={[styles.requirementsTitle, { color: colors.text }]}>
                            Persyaratan Password:
                        </Text>
                        {passwordRequirements.map((requirement, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <View style={[
                                    styles.requirementIcon,
                                    { backgroundColor: requirement.test(password) ? colors.success + '20' : colors.border }
                                ]}>
                                    <Check
                                        size={12}
                                        color={requirement.test(password) ? colors.success : colors.textSecondary}
                                    />
                                </View>
                                <Text style={[
                                    styles.requirementText,
                                    {
                                        color: requirement.test(password) ? colors.success : colors.textSecondary,
                                        fontFamily: requirement.test(password) ? 'Inter_500Medium' : 'Inter_400Regular'
                                    }
                                ]}>
                                    {requirement.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {renderPasswordForm()}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    landscapeRow: {
        flexDirection: 'row',
        gap: 50,
        paddingHorizontal: 60,
        paddingTop: 200,
        paddingBottom: 40,
        flex: 1,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 24,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    progressLine: {
        width: 24,
        height: 2,
        marginHorizontal: 4,
    },
    requirementsContainer: {
        marginBottom: 24,
    },
    requirementsTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    requirementText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        flex: 1,
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
    },
    passwordInputContainer: {
        position: 'relative',
    },
    passwordInput: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingRight: 45,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -10,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginTop: 4,
    },
    completeButton: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    completeButtonText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
});
