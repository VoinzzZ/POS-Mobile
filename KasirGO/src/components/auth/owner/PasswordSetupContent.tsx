import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import ThemeToggle from '@/src/components/shared/ThemeToggle';

interface OwnerPasswordSetupContentProps {
  colors: any;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  params: any;
  completeOwnerRegistration: any;
  router: any;
}

export default function OwnerPasswordSetupContent({
  colors,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  setLoading,
  params,
  completeOwnerRegistration,
  router
}: OwnerPasswordSetupContentProps) {

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
    if (!isPasswordValid) {
      Alert.alert('Error', 'Password tidak memenuhi persyaratan');
      return;
    }

    if (!isPasswordMatch) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }

    if (!params.registration_id) {
      Alert.alert('Error', 'Registration ID tidak ditemukan. Silakan mulai dari awal.');
      return;
    }

    setLoading(true);
    try {
      // Mock registration completion for UI testing
      console.log('Mock completing owner registration...');

      const combinedData = {
        ...params,
        password: password,
      };

      router.push({
        pathname: '/auth/register/owner/completion',
        params: combinedData
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menyelesaikan pendaftaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Lock size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Buat Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Buat password aman untuk akun pemilik toko Anda
              </Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
          </View>

  
          {/* Password Requirements */}
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

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Password
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text
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
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Konfirmasi Password
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: colors.card,
                      borderColor: isPasswordMatch ? colors.success : colors.border,
                      color: colors.text
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
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword && !isPasswordMatch && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  Password tidak cocok
                </Text>
              )}
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardTitle, { color: colors.warning }]}>
              Menunggu Persetujuan
            </Text>
            <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
              Setelah pendaftaran selesai, akun Anda perlu disetujui oleh Super Admin sebelum dapat digunakan. Proses ini biasanya memakan waktu 1-2 hari kerja.
            </Text>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              (!isPasswordValid || !isPasswordMatch || loading) && styles.buttonDisabled,
              {
                backgroundColor: (isPasswordValid && isPasswordMatch && !loading)
                  ? colors.primary
                  : colors.disabled
              }
            ]}
            onPress={handleCompleteRegistration}
            disabled={!isPasswordValid || !isPasswordMatch || loading}
          >
            <Text style={[styles.completeButtonText, { color: colors.background }]}>
              {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 20,
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
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
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
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  completeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
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
  },
});